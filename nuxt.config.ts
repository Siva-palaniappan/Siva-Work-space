// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    devServer: {
      port: 1985
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['vuetify/styles','@/assets/css/tailwind.css'],
  build: {
    transpile: ['vuetify']
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
   runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:5000/api'
    }
  },
   components: true
})