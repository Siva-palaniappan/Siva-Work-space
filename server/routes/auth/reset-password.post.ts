import { resetPassword } from '../../utils/spendnest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim()
  const password = String(body?.password ?? '')
  const confirmPassword = String(body?.confirmPassword ?? '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and new password are required' })
  }
  if (password.length < 7) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 7 characters' })
  }
  if (password !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Passwords do not match' })
  }

  try {
    await resetPassword(email, password)
    return { success: true }
  } catch (err: any) {
    if (err.message === 'USER_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'No account found with that email' })
    }
    throw err
  }
})
