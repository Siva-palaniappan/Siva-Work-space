import { updateExpense } from '../../utils/spendnest'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userid = String(body?.userid ?? '').trim()
  const expenseid = String(body?.expenseid ?? '').trim()
  const originalCategory = String(body?.originalCategory ?? '').trim()
  const category = String(body?.category ?? '').trim()
  const amount = Number(body?.amount)
  const dateofexpense = String(body?.dateofexpense ?? '').trim()

  if (!userid || !expenseid || !originalCategory || !category) {
    throw createError({ statusCode: 400, statusMessage: 'userid, expenseid, originalCategory and category are required' })
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'amount must be a positive number' })
  }
  if (!DATE_RE.test(dateofexpense)) {
    throw createError({ statusCode: 400, statusMessage: 'dateofexpense must be a valid YYYY-MM-DD date' })
  }

  try {
    return await updateExpense(userid, expenseid, originalCategory, category, amount, dateofexpense)
  } catch (err: any) {
    if (err.message === 'EXPENSE_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Expense not found' })
    }
    throw err
  }
})
