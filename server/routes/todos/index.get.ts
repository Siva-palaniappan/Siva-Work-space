import { getTodos } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')

  if (!userid) {
    throw createError({ statusCode: 400, statusMessage: 'userid is required' })
  }

  return await getTodos(userid)
})
