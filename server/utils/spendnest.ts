import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { getPool } from './db'

export interface UserRow {
  userid: string
  name: string
  phone: string
  email: string
  password: string
}

export interface CategoryRow {
  catid: string
  category: string
  createdon: string
  userid: string
}

export interface ExpenseEntry {
  expenseid: string
  category: string
  amount: number
  dateofexpense: string
}

export function hashPassword(plain: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(plain: string, stored: string) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(plain, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  if (candidate.length !== expected.length) return false
  return timingSafeEqual(candidate, expected)
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const { rows } = await getPool().query(
    'select userid, name, phone, email, password from users where lower(email) = lower($1)',
    [email],
  )
  return rows[0]
}

export async function createUser(data: { name: string; phone: string; email: string; password: string }): Promise<UserRow> {
  if (await findUserByEmail(data.email)) {
    throw new Error('EMAIL_EXISTS')
  }
  const { rows } = await getPool().query(
    `insert into users (name, phone, email, password)
     values ($1, $2, $3, $4)
     returning userid, name, phone, email, password`,
    [data.name, data.phone, data.email, hashPassword(data.password)],
  )
  return rows[0]
}

export async function getCategories(userid: string): Promise<CategoryRow[]> {
  const { rows } = await getPool().query(
    `select catid, category, to_char(createdon, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as createdon, userid
     from categories where userid = $1 order by createdon desc`,
    [userid],
  )
  return rows
}

export async function createCategory(userid: string, category: string): Promise<CategoryRow> {
  try {
    const { rows } = await getPool().query(
      `insert into categories (category, userid)
       values ($1, $2)
       returning catid, category, to_char(createdon, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as createdon, userid`,
      [category, userid],
    )
    return rows[0]
  } catch (err: any) {
    if (err.code === '23505') {
      throw new Error('CATEGORY_EXISTS')
    }
    throw err
  }
}

export async function getExpenses(userid: string, from?: string, to?: string): Promise<ExpenseEntry[]> {
  const conditions = ['userid = $1']
  const params: any[] = [userid]
  if (from) {
    params.push(from)
    conditions.push(`dateofexpense >= $${params.length}`)
  }
  if (to) {
    params.push(to)
    conditions.push(`dateofexpense <= $${params.length}`)
  }

  const { rows } = await getPool().query(
    `select expenseid, category, amount, to_char(dateofexpense, 'YYYY-MM-DD') as dateofexpense
     from expenses where ${conditions.join(' and ')} order by dateofexpense desc`,
    params,
  )
  return rows.map(r => ({ ...r, amount: Number(r.amount) }))
}

export async function addExpense(userid: string, category: string, amount: number, dateofexpense: string): Promise<ExpenseEntry> {
  const { rows } = await getPool().query(
    `insert into expenses (category, amount, userid, dateofexpense)
     values ($1, $2, $3, $4)
     returning expenseid, category, amount, to_char(dateofexpense, 'YYYY-MM-DD') as dateofexpense`,
    [category, amount, userid, dateofexpense],
  )
  return { ...rows[0], amount: Number(rows[0].amount) }
}

export async function updateExpense(
  userid: string,
  expenseid: string,
  category: string,
  amount: number,
  dateofexpense: string,
): Promise<ExpenseEntry> {
  const { rows } = await getPool().query(
    `update expenses set category = $1, amount = $2, dateofexpense = $3
     where expenseid = $4 and userid = $5
     returning expenseid, category, amount, to_char(dateofexpense, 'YYYY-MM-DD') as dateofexpense`,
    [category, amount, dateofexpense, expenseid, userid],
  )
  if (!rows[0]) {
    throw new Error('EXPENSE_NOT_FOUND')
  }
  return { ...rows[0], amount: Number(rows[0].amount) }
}

export async function deleteExpense(userid: string, expenseid: string): Promise<void> {
  const { rowCount } = await getPool().query('delete from expenses where expenseid = $1 and userid = $2', [expenseid, userid])
  if (rowCount === 0) {
    throw new Error('EXPENSE_NOT_FOUND')
  }
}

export function aggregateExpensesByCategory(rows: ExpenseEntry[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const row of rows) {
    totals[row.category] = (totals[row.category] || 0) + row.amount
  }
  return totals
}
