import { deleteExpense } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')
  const expenseid = String(query.expenseid ?? '')

  if (!userid || !expenseid) {
    throw createError({ statusCode: 400, statusMessage: 'userid and expenseid are required' })
  }

  try {
    await deleteExpense(userid, expenseid)
    return { success: true }
  } catch (err: any) {
    if (err.message === 'EXPENSE_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Expense not found' })
    }
    throw err
  }
})
