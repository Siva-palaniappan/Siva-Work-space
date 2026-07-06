import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { readRows, withFileLock, writeRows } from './excelStore'

export const USERS_FILE = 'users.xlsx'
export const USERS_SHEET = 'Users'
export const USER_HEADERS = ['userid', 'name', 'phone', 'email', 'password']

export const CATEGORIES_FILE = 'categories.xlsx'
export const CATEGORIES_SHEET = 'Categories'
export const CATEGORY_HEADERS = ['catid', 'category', 'createdon', 'userid']

export const EXPENSES_FILE = 'expenses.xlsx'
export const EXPENSES_SHEET = 'Expenses'
export const EXPENSE_HEADERS = ['expenseid', 'expensedata', 'userid', 'dateofexpense']

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

export interface ExpenseRow {
  expenseid: string
  expensedata: string
  userid: string
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

export async function getUsers(): Promise<UserRow[]> {
  return readRows(USERS_FILE, USERS_SHEET, USER_HEADERS) as Promise<UserRow[]>
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const users = await getUsers()
  return users.find(u => String(u.email).toLowerCase() === email.toLowerCase())
}

export async function createUser(data: { name: string; phone: string; email: string; password: string }): Promise<UserRow> {
  return withFileLock(USERS_FILE, async () => {
    const users = await getUsers()
    if (users.some(u => String(u.email).toLowerCase() === data.email.toLowerCase())) {
      throw new Error('EMAIL_EXISTS')
    }
    const user: UserRow = {
      userid: randomUUID(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: hashPassword(data.password),
    }
    users.push(user)
    await writeRows(USERS_FILE, USERS_SHEET, USER_HEADERS, users)
    return user
  })
}

export async function getCategories(userid: string): Promise<CategoryRow[]> {
  const rows = (await readRows(CATEGORIES_FILE, CATEGORIES_SHEET, CATEGORY_HEADERS)) as CategoryRow[]
  return rows.filter(r => r.userid === userid)
}

export async function createCategory(userid: string, category: string): Promise<CategoryRow> {
  return withFileLock(CATEGORIES_FILE, async () => {
    const rows = (await readRows(CATEGORIES_FILE, CATEGORIES_SHEET, CATEGORY_HEADERS)) as CategoryRow[]
    const exists = rows.some(r => r.userid === userid && String(r.category).toLowerCase() === category.toLowerCase())
    if (exists) {
      throw new Error('CATEGORY_EXISTS')
    }
    const row: CategoryRow = {
      catid: randomUUID(),
      category,
      createdon: new Date().toISOString(),
      userid,
    }
    rows.push(row)
    await writeRows(CATEGORIES_FILE, CATEGORIES_SHEET, CATEGORY_HEADERS, rows)
    return row
  })
}

export async function getExpenses(userid: string): Promise<ExpenseRow[]> {
  const rows = (await readRows(EXPENSES_FILE, EXPENSES_SHEET, EXPENSE_HEADERS)) as ExpenseRow[]
  return rows.filter(r => r.userid === userid)
}

export async function addExpense(userid: string, category: string, amount: number, dateofexpense: string): Promise<ExpenseRow> {
  return withFileLock(EXPENSES_FILE, async () => {
    const rows = (await readRows(EXPENSES_FILE, EXPENSES_SHEET, EXPENSE_HEADERS)) as ExpenseRow[]
    const row: ExpenseRow = {
      expenseid: randomUUID(),
      expensedata: JSON.stringify({ [category]: amount }),
      userid,
      dateofexpense,
    }
    rows.push(row)
    await writeRows(EXPENSES_FILE, EXPENSES_SHEET, EXPENSE_HEADERS, rows)
    return row
  })
}

// A single expenseid row can hold more than one category key (e.g. legacy
// rows written before each submit became its own row). The "View All" list
// flattens each key into its own line item, so edit/delete must only touch
// the one category key being acted on — never overwrite the whole row.
export async function updateExpense(
  userid: string,
  expenseid: string,
  originalCategory: string,
  category: string,
  amount: number,
  dateofexpense: string,
): Promise<ExpenseRow> {
  return withFileLock(EXPENSES_FILE, async () => {
    const rows = (await readRows(EXPENSES_FILE, EXPENSES_SHEET, EXPENSE_HEADERS)) as ExpenseRow[]
    const row = rows.find(r => r.expenseid === expenseid && r.userid === userid)
    if (!row) {
      throw new Error('EXPENSE_NOT_FOUND')
    }
    const data = JSON.parse(row.expensedata || '{}')
    delete data[originalCategory]
    data[category] = amount
    row.dateofexpense = dateofexpense
    row.expensedata = JSON.stringify(data)
    await writeRows(EXPENSES_FILE, EXPENSES_SHEET, EXPENSE_HEADERS, rows)
    return row
  })
}

export async function deleteExpense(userid: string, expenseid: string, category: string): Promise<void> {
  return withFileLock(EXPENSES_FILE, async () => {
    const rows = (await readRows(EXPENSES_FILE, EXPENSES_SHEET, EXPENSE_HEADERS)) as ExpenseRow[]
    const row = rows.find(r => r.expenseid === expenseid && r.userid === userid)
    if (!row) {
      throw new Error('EXPENSE_NOT_FOUND')
    }
    const data = JSON.parse(row.expensedata || '{}')
    delete data[category]

    if (Object.keys(data).length === 0) {
      rows.splice(rows.indexOf(row), 1)
    } else {
      row.expensedata = JSON.stringify(data)
    }

    await writeRows(EXPENSES_FILE, EXPENSES_SHEET, EXPENSE_HEADERS, rows)
  })
}

export function aggregateExpensesByCategory(rows: ExpenseRow[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const row of rows) {
    let data: Record<string, number> = {}
    try {
      data = JSON.parse(row.expensedata || '{}')
    } catch {
      continue
    }
    for (const [category, amount] of Object.entries(data)) {
      totals[category] = (totals[category] || 0) + (Number(amount) || 0)
    }
  }
  return totals
}

export interface ExpenseEntry {
  expenseid: string
  category: string
  amount: number
  dateofexpense: string
}

export function flattenExpenseEntries(rows: ExpenseRow[]): ExpenseEntry[] {
  const entries: ExpenseEntry[] = []
  for (const row of rows) {
    let data: Record<string, number> = {}
    try {
      data = JSON.parse(row.expensedata || '{}')
    } catch {
      continue
    }
    for (const [category, amount] of Object.entries(data)) {
      entries.push({
        expenseid: row.expenseid,
        category,
        amount: Number(amount) || 0,
        dateofexpense: row.dateofexpense,
      })
    }
  }
  return entries.sort((a, b) => b.dateofexpense.localeCompare(a.dateofexpense))
}
