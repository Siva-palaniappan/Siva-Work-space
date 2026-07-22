import { updateTodo } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userid = String(body?.userid ?? '').trim()
  const todoid = String(body?.todoid ?? '').trim()

  if (!userid || !todoid) {
    throw createError({ statusCode: 400, statusMessage: 'userid and todoid are required' })
  }

  const changes: { title?: string; notes?: string | null; duedate?: string | null; completed?: boolean } = {}
  if (body?.title !== undefined) changes.title = String(body.title).trim()
  if (body?.notes !== undefined) changes.notes = body.notes ? String(body.notes).trim() : null
  if (body?.duedate !== undefined) changes.duedate = body.duedate ? String(body.duedate) : null
  if (body?.completed !== undefined) changes.completed = Boolean(body.completed)

  try {
    return await updateTodo(userid, todoid, changes)
  } catch (err: any) {
    if (err.message === 'TODO_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Task not found' })
    }
    if (err.message === 'NOTHING_TO_UPDATE') {
      throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
    }
    throw err
  }
})
