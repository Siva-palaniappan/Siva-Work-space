import { createTodo } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userid = String(body?.userid ?? '').trim()
  const title = String(body?.title ?? '').trim()

  if (!userid || !title) {
    throw createError({ statusCode: 400, statusMessage: 'userid and title are required' })
  }

  const notes = body?.notes ? String(body.notes).trim() : null
  const duedate = body?.duedate ? String(body.duedate) : null

  return await createTodo(userid, title, notes, duedate)
})
