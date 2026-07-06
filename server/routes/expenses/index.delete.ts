import { deleteExpense } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')
  const expenseid = String(query.expenseid ?? '')
  const category = String(query.category ?? '')

  if (!userid || !expenseid || !category) {
    throw createError({ statusCode: 400, statusMessage: 'userid, expenseid and category are required' })
  }

  try {
    await deleteExpense(userid, expenseid, category)
    return { success: true }
  } catch (err: any) {
    if (err.message === 'EXPENSE_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Expense not found' })
    }
    throw err
  }
})
