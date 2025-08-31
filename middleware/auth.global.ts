export default defineNuxtRouteMiddleware((to, from) => {
  // Get token (you can store it in localStorage or use useCookie)
  // const token = localStorage.getItem('jwt')

  // // If not logged in and trying to access protected page
  // if (!token && to.path === '/gallery') {
  //   return navigateTo('/login')
  // }
})
