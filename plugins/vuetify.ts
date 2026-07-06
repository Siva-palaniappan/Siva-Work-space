// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Import Vuetify styles
import 'vuetify/styles'
// Import MDI icons
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'spendnest',
      themes: {
        spendnest: {
          dark: false,
          colors: {
            primary: '#2F6B3D',
            'primary-darken-1': '#245530',
            secondary: '#4C9457',
            background: '#F5F1E8',
            surface: '#FFFFFF',
            error: '#B00020',
            info: '#2196F3',
            success: '#2F6B3D',
            warning: '#FB8C00',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
