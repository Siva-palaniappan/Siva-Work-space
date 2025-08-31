import axios from 'axios';

export default defineNuxtPlugin(() => {
  const instance = axios.create({
    baseURL: 'https://localhost:5001/api',
  })

  instance.interceptors.request.use((config:any) => {
    const token = localStorage.getItem('jwt')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return {
    provide: {
      axios: instance,
    },
  }
})
