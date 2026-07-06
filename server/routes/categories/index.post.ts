import { createCategory } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userid = String(body?.userid ?? '').trim()
  const category = String(body?.category ?? '').trim()

  if (!userid || !category) {
    throw createError({ statusCode: 400, statusMessage: 'userid and category are required' })
  }

  try {
    return await createCategory(userid, category)
  } catch (err: any) {
    if (err.message === 'CATEGORY_EXISTS') {
      throw createError({ statusCode: 409, statusMessage: 'Category already exists' })
    }
    throw err
  }
})
