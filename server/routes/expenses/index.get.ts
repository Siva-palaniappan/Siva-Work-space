import { aggregateExpensesByCategory, getCategories, getExpenses } from '../../utils/spendnest'

function currentMonthRange() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const start = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const end = `${lastDay.getFullYear()}-${pad(lastDay.getMonth() + 1)}-${pad(lastDay.getDate())}`
  return { start, end }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')
  const from = String(query.from ?? '')
  const to = String(query.to ?? '')

  if (!userid) {
    throw createError({ statusCode: 400, statusMessage: 'userid is required' })
  }

  const { start: monthStart, end: monthEnd } = currentMonthRange()

  const [categories, entries, monthEntries] = await Promise.all([
    getCategories(userid),
    getExpenses(userid, from || undefined, to || undefined),
    getExpenses(userid, monthStart, monthEnd),
  ])

  const totalsByCategory = aggregateExpensesByCategory(entries)
  const monthTotalsByCategory = aggregateExpensesByCategory(monthEntries)

  const totals = categories.map(c => ({
    catid: c.catid,
    category: c.category,
    amount: totalsByCategory[c.category] || 0,
    budget: c.budget,
    monthSpent: monthTotalsByCategory[c.category] || 0,
  }))

  return { entries, totals }
})
