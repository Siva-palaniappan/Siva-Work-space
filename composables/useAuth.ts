import { useFetch } from '#app'

export function useAuth() {
    const config = useRuntimeConfig()
  // Register user
  const register = async (email: string, password: string, phoneNumber: string) => {
    return await useFetch(  `${config.public.apiBase}/registration`, {
      method: 'POST',
      body: { email, password, phoneNumber }
    })
  }

  // Login user
  const login = async (email: string, password: string) => {
    return await useFetch(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { email, password }
    })
  }

  
  const submitEmail = async (email: string) => {
    // try {
    //   const { data, error } = await useFetch(`${config.public.apiBase}/auth/forgot-password`, {
    //     method: 'POST',
    //     body: { email }
    //   })

    //   if (error.value) {
    //     throw new Error(error.value.message || 'Something went wrong')
    //   }

    //   return data.value
    // } catch (err: any) {
    //   throw new Error(err.message || 'Something went wrong')
    // }

     return  await useFetch(`${config.public.apiBase}/auth/forgot-password`, {
        method: 'POST',
        body: { email }
      })
  }

  const submitReset = async (token: string, newPassword: string) => {
    // try {
    //   const { data, error } = await useFetch(`${config.public.apiBase}/auth/reset-password`, {
    //     method: 'POST',
    //     body: { token, newPassword }
    //   })

    //   if (error.value) {
    //     throw new Error(error.value.message || 'Something went wrong')
    //   }

    //   return data.value
    // } catch (err: any) {
    //   throw new Error(err.message || 'Something went wrong')
    // }

    return await useFetch(`${config.public.apiBase}/auth/reset-password`, {
        method: 'POST',
        body: { token, newPassword }
      })

  }

  return {register, login, submitEmail, submitReset }
}
