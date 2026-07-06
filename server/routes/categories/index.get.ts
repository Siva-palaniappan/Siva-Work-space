import { getCategories } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')

  if (!userid) {
    throw createError({ statusCode: 400, statusMessage: 'userid is required' })
  }

  const categories = await getCategories(userid)
  return categories.sort((a, b) => String(b.createdon).localeCompare(String(a.createdon)))
})
