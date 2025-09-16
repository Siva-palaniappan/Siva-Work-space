// composables/useExpenseApi.ts


export const useExpenseApi = () => {
  const config = useRuntimeConfig()

  const addExpenseType = async (expenseType: string, userId: number) => {
    return await $fetch(`${config.public.apiBase}/ExpenseTypes`, {
      method: "POST",
      body: {
        expenseTypeName: expenseType,
        userId: userId
      }
    })
  }

  const getExpenseTypes = async () => {
    return await $fetch(`${config.public.apiBase}/ExpenseTypes`)
  }

  const deleteExpenseType = async (id: number) => {
    return await $fetch(`${config.public.apiBase}/ExpenseTypes/${id}`, {
      method: "DELETE"
    })
  }

  return { addExpenseType, getExpenseTypes, deleteExpenseType }
}
