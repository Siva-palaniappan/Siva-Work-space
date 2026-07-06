import { aggregateExpensesByCategory, flattenExpenseEntries, getCategories, getExpenses } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')
  const from = String(query.from ?? '')
  const to = String(query.to ?? '')

  if (!userid) {
    throw createError({ statusCode: 400, statusMessage: 'userid is required' })
  }

  const [categories, allExpenses] = await Promise.all([getCategories(userid), getExpenses(userid)])

  // dateofexpense is stored as YYYY-MM-DD, so plain string comparison sorts chronologically.
  const expenses = allExpenses.filter(row => {
    if (from && row.dateofexpense < from) return false
    if (to && row.dateofexpense > to) return false
    return true
  })

  const totalsByCategory = aggregateExpensesByCategory(expenses)

  const totals = categories.map(c => ({
    catid: c.catid,
    category: c.category,
    amount: totalsByCategory[c.category] || 0,
  }))

  const entries = flattenExpenseEntries(expenses)

  return { entries, totals }
})
