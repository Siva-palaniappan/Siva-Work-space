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
  budget: number | null
}

export interface ExpenseEntry {
  expenseid: string
  catid: string
  category: string
  amount: number
  description: string
  dateofexpense: string
}

export interface TodoRow {
  todoid: string
  userid: string
  title: string
  notes: string
  duedate: string | null
  completed: boolean
  createdon: string
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

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  const { rowCount } = await getPool().query(
    'update users set password = $1 where lower(email) = lower($2)',
    [hashPassword(newPassword), email],
  )
  if (rowCount === 0) {
    throw new Error('USER_NOT_FOUND')
  }
}

const withBudgetNumber = (row: any): CategoryRow => ({
  ...row,
  budget: row.budget === null ? null : Number(row.budget),
})

export async function getCategories(userid: string): Promise<CategoryRow[]> {
  const { rows } = await getPool().query(
    `select catid, category, to_char(createdon, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as createdon, userid, budget
     from categories where userid = $1 order by createdon desc`,
    [userid],
  )
  return rows.map(withBudgetNumber)
}

export async function createCategory(userid: string, category: string, budget: number | null = null): Promise<CategoryRow> {
  try {
    const { rows } = await getPool().query(
      `insert into categories (category, userid, budget)
       values ($1, $2, $3)
       returning catid, category, to_char(createdon, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as createdon, userid, budget`,
      [category, userid, budget],
    )
    return withBudgetNumber(rows[0])
  } catch (err: any) {
    if (err.code === '23505') {
      throw new Error('CATEGORY_EXISTS')
    }
    throw err
  }
}

// Since expenses only ever reference catid (not a duplicated name), renaming a
// category needs no cascade at all -- every linked expense resolves the new
// name automatically through the join in getExpenses.
export async function updateCategory(
  userid: string,
  catid: string,
  changes: { category?: string; budget?: number | null },
): Promise<CategoryRow> {
  const sets: string[] = []
  const params: any[] = []

  if (changes.category !== undefined) {
    params.push(changes.category)
    sets.push(`category = $${params.length}`)
  }
  if ('budget' in changes) {
    params.push(changes.budget)
    sets.push(`budget = $${params.length}`)
  }
  if (!sets.length) {
    throw new Error('NOTHING_TO_UPDATE')
  }

  params.push(catid, userid)

  try {
    const { rows } = await getPool().query(
      `update categories set ${sets.join(', ')}
       where catid = $${params.length - 1} and userid = $${params.length}
       returning catid, category, to_char(createdon, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as createdon, userid, budget`,
      params,
    )
    if (!rows[0]) {
      throw new Error('CATEGORY_NOT_FOUND')
    }
    return withBudgetNumber(rows[0])
  } catch (err: any) {
    if (err.code === '23505') {
      throw new Error('CATEGORY_EXISTS')
    }
    throw err
  }
}

// Relies on expenses.catid's ON DELETE CASCADE foreign key -- deleting the
// category row automatically removes every expense that referenced it.
export async function deleteCategory(userid: string, catid: string): Promise<void> {
  const { rowCount } = await getPool().query('delete from categories where catid = $1 and userid = $2', [catid, userid])
  if (rowCount === 0) {
    throw new Error('CATEGORY_NOT_FOUND')
  }
}

export async function getExpenses(userid: string, from?: string, to?: string): Promise<ExpenseEntry[]> {
  const conditions = ['e.userid = $1']
  const params: any[] = [userid]
  if (from) {
    params.push(from)
    conditions.push(`e.dateofexpense >= $${params.length}`)
  }
  if (to) {
    params.push(to)
    conditions.push(`e.dateofexpense <= $${params.length}`)
  }

  const { rows } = await getPool().query(
    `select e.expenseid, e.catid, c.category, e.amount, coalesce(e.description, '') as description,
            to_char(e.dateofexpense, 'YYYY-MM-DD') as dateofexpense
     from expenses e
     join categories c on c.catid = e.catid
     where ${conditions.join(' and ')}
     order by e.dateofexpense desc`,
    params,
  )
  return rows.map(r => ({ ...r, amount: Number(r.amount) }))
}

export async function addExpense(
  userid: string,
  catid: string,
  amount: number,
  dateofexpense: string,
  description: string,
): Promise<ExpenseEntry> {
  const { rows } = await getPool().query(
    `with inserted as (
       insert into expenses (catid, amount, userid, dateofexpense, description)
       values ($1, $2, $3, $4, $5)
       returning expenseid, catid, amount, description, dateofexpense
     )
     select i.expenseid, i.catid, c.category, i.amount, coalesce(i.description, '') as description,
            to_char(i.dateofexpense, 'YYYY-MM-DD') as dateofexpense
     from inserted i
     join categories c on c.catid = i.catid`,
    [catid, amount, userid, dateofexpense, description],
  )
  return { ...rows[0], amount: Number(rows[0].amount) }
}

export async function updateExpense(
  userid: string,
  expenseid: string,
  catid: string,
  amount: number,
  dateofexpense: string,
  description: string,
): Promise<ExpenseEntry> {
  const { rows } = await getPool().query(
    `with updated as (
       update expenses set catid = $1, amount = $2, dateofexpense = $3, description = $4
       where expenseid = $5 and userid = $6
       returning expenseid, catid, amount, description, dateofexpense
     )
     select u.expenseid, u.catid, c.category, u.amount, coalesce(u.description, '') as description,
            to_char(u.dateofexpense, 'YYYY-MM-DD') as dateofexpense
     from updated u
     join categories c on c.catid = u.catid`,
    [catid, amount, dateofexpense, description, expenseid, userid],
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

const TODO_COLUMNS = `todoid, userid, title, coalesce(notes, '') as notes,
       to_char(duedate, 'YYYY-MM-DD') as duedate, completed,
       to_char(createdon, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as createdon`

export async function getTodos(userid: string): Promise<TodoRow[]> {
  const { rows } = await getPool().query(
    `select ${TODO_COLUMNS}
     from todos where userid = $1
     order by completed asc, duedate asc nulls last, createdon desc`,
    [userid],
  )
  return rows
}

export async function createTodo(
  userid: string,
  title: string,
  notes: string | null,
  duedate: string | null,
): Promise<TodoRow> {
  const { rows } = await getPool().query(
    `insert into todos (userid, title, notes, duedate)
     values ($1, $2, $3, $4)
     returning ${TODO_COLUMNS}`,
    [userid, title, notes || null, duedate || null],
  )
  return rows[0]
}

export async function updateTodo(
  userid: string,
  todoid: string,
  changes: { title?: string; notes?: string | null; duedate?: string | null; completed?: boolean },
): Promise<TodoRow> {
  const sets: string[] = []
  const params: any[] = []

  if (changes.title !== undefined) {
    params.push(changes.title)
    sets.push(`title = $${params.length}`)
  }
  if ('notes' in changes) {
    params.push(changes.notes || null)
    sets.push(`notes = $${params.length}`)
  }
  if ('duedate' in changes) {
    params.push(changes.duedate || null)
    sets.push(`duedate = $${params.length}`)
  }
  if (changes.completed !== undefined) {
    params.push(changes.completed)
    sets.push(`completed = $${params.length}`)
  }
  if (!sets.length) {
    throw new Error('NOTHING_TO_UPDATE')
  }

  params.push(todoid, userid)
  const { rows } = await getPool().query(
    `update todos set ${sets.join(', ')}
     where todoid = $${params.length - 1} and userid = $${params.length}
     returning ${TODO_COLUMNS}`,
    params,
  )
  if (!rows[0]) {
    throw new Error('TODO_NOT_FOUND')
  }
  return rows[0]
}

export async function deleteTodo(userid: string, todoid: string): Promise<void> {
  const { rowCount } = await getPool().query('delete from todos where todoid = $1 and userid = $2', [todoid, userid])
  if (rowCount === 0) {
    throw new Error('TODO_NOT_FOUND')
  }
}
