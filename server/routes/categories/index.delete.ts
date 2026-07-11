import { deleteCategory } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')
  const catid = String(query.catid ?? '')

  if (!userid || !catid) {
    throw createError({ statusCode: 400, statusMessage: 'userid and catid are required' })
  }

  try {
    await deleteCategory(userid, catid)
    return { success: true }
  } catch (err: any) {
    if (err.message === 'CATEGORY_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }
    throw err
  }
})
