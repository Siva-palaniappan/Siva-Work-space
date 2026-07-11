import { updateExpense } from '../../utils/spendnest'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userid = String(body?.userid ?? '').trim()
  const expenseid = String(body?.expenseid ?? '').trim()
  const catid = String(body?.catid ?? '').trim()
  const amount = Number(body?.amount)
  const dateofexpense = String(body?.dateofexpense ?? '').trim()
  const description = String(body?.description ?? '').trim()

  if (!userid || !expenseid || !catid) {
    throw createError({ statusCode: 400, statusMessage: 'userid, expenseid and catid are required' })
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'amount must be a positive number' })
  }
  if (!DATE_RE.test(dateofexpense)) {
    throw createError({ statusCode: 400, statusMessage: 'dateofexpense must be a valid YYYY-MM-DD date' })
  }

  try {
    return await updateExpense(userid, expenseid, catid, amount, dateofexpense, description)
  } catch (err: any) {
    if (err.message === 'EXPENSE_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Expense not found' })
    }
    throw err
  }
})
