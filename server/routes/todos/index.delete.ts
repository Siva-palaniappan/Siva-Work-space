import { deleteTodo } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userid = String(query.userid ?? '')
  const todoid = String(query.todoid ?? '')

  if (!userid || !todoid) {
    throw createError({ statusCode: 400, statusMessage: 'userid and todoid are required' })
  }

  try {
    await deleteTodo(userid, todoid)
    return { success: true }
  } catch (err: any) {
    if (err.message === 'TODO_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Task not found' })
    }
    throw err
  }
})
