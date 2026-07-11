import { updateCategoryBudget } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userid = String(body?.userid ?? '').trim()
  const catid = String(body?.catid ?? '').trim()

  if (!userid || !catid) {
    throw createError({ statusCode: 400, statusMessage: 'userid and catid are required' })
  }

  let budget: number | null = null
  if (body?.budget !== null && body?.budget !== undefined && body?.budget !== '') {
    budget = Number(body.budget)
    if (!Number.isFinite(budget) || budget < 0) {
      throw createError({ statusCode: 400, statusMessage: 'budget must be a non-negative number' })
    }
  }

  try {
    return await updateCategoryBudget(userid, catid, budget)
  } catch (err: any) {
    if (err.message === 'CATEGORY_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }
    throw err
  }
})
