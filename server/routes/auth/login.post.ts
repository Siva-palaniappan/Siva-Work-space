import { findUserByEmail, verifyPassword } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim()
  const password = String(body?.password ?? '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const user = await findUserByEmail(email)
  if (!user || !verifyPassword(password, user.password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  return { userid: user.userid, name: user.name, email: user.email }
})
