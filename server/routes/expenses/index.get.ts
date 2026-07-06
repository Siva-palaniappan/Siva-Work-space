import { aggregateExpensesByCategory, getCategories, getExpenses } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')
  const from = String(query.from ?? '')
  const to = String(query.to ?? '')

  if (!userid) {
    throw createError({ statusCode: 400, statusMessage: 'userid is required' })
  }

  const [categories, entries] = await Promise.all([
    getCategories(userid),
    getExpenses(userid, from || undefined, to || undefined),
  ])

  const totalsByCategory = aggregateExpensesByCategory(entries)
  const totals = categories.map(c => ({
    catid: c.catid,
    category: c.category,
    amount: totalsByCategory[c.category] || 0,
  }))

  return { entries, totals }
})
