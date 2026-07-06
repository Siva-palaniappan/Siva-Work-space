import { createUser } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = String(body?.name ?? '').trim()
  const phone = String(body?.phone ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const password = String(body?.password ?? '')
  const confirmPassword = String(body?.confirmPassword ?? '')

  if (!name || !phone || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required' })
  }
  if (password.length < 7) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 7 characters' })
  }
  if (password !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Passwords do not match' })
  }

  try {
    const user = await createUser({ name, phone, email, password })
    return { userid: user.userid, name: user.name, email: user.email }
  } catch (err: any) {
    if (err.message === 'EMAIL_EXISTS') {
      throw createError({ statusCode: 409, statusMessage: 'Email is already registered' })
    }
    throw err
  }
})
