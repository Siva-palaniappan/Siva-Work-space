import { updateCategory } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userid = String(body?.userid ?? '').trim()
  const catid = String(body?.catid ?? '').trim()

  if (!userid || !catid) {
    throw createError({ statusCode: 400, statusMessage: 'userid and catid are required' })
  }

  const changes: { category?: string; budget?: number | null } = {}

  if (body?.category !== undefined) {
    const category = String(body.category).trim()
    if (!category) {
      throw createError({ statusCode: 400, statusMessage: 'category cannot be empty' })
    }
    changes.category = category
  }

  if (body?.budget !== undefined) {
    if (body.budget === null || body.budget === '') {
      changes.budget = null
    } else {
      const budget = Number(body.budget)
      if (!Number.isFinite(budget) || budget < 0) {
        throw createError({ statusCode: 400, statusMessage: 'budget must be a non-negative number' })
      }
      changes.budget = budget
    }
  }

  try {
    return await updateCategory(userid, catid, changes)
  } catch (err: any) {
    if (err.message === 'CATEGORY_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }
    if (err.message === 'CATEGORY_EXISTS') {
      throw createError({ statusCode: 409, statusMessage: 'Category already exists' })
    }
    if (err.message === 'NOTHING_TO_UPDATE') {
      throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
    }
    throw err
  }
})
