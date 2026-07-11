import { addExpense } from '../../utils/spendnest'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userid = String(body?.userid ?? '').trim()
  const catid = String(body?.catid ?? '').trim()
  const amount = Number(body?.amount)
  const dateofexpense = String(body?.dateofexpense ?? '').trim()
  const description = String(body?.description ?? '').trim()

  if (!userid || !catid) {
    throw createError({ statusCode: 400, statusMessage: 'userid and catid are required' })
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'amount must be a positive number' })
  }
  if (!DATE_RE.test(dateofexpense)) {
    throw createError({ statusCode: 400, statusMessage: 'dateofexpense must be a valid YYYY-MM-DD date' })
  }

  return await addExpense(userid, catid, amount, dateofexpense, description)
})
