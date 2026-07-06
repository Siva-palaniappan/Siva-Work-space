<template>
  <v-app-bar v-if="showNav" color="primary" density="comfortable">
    <v-tabs v-model="activeTab" grow>
      <v-tab value="expense" @click="router.push('/expense')">Expense</v-tab>
      <v-tab value="category" @click="router.push('/category')">Category</v-tab>
    </v-tabs>
    <v-btn icon="mdi-logout" variant="text" @click="onSignOut" title="Sign out" />
  </v-app-bar>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const showNav = ref(false)
const activeTab = ref('expense')

const syncTabFromRoute = () => {
  if (route.path.startsWith('/category')) activeTab.value = 'category'
  else if (route.path.startsWith('/expense')) activeTab.value = 'expense'
}

onMounted(() => {
  showNav.value = !!localStorage.getItem('spendnest_userid')
  syncTabFromRoute()
})

watch(() => route.path, () => {
  showNav.value = !!localStorage.getItem('spendnest_userid')
  syncTabFromRoute()
})

const onSignOut = () => {
  localStorage.removeItem('spendnest_userid')
  localStorage.removeItem('spendnest_username')
  showNav.value = false
  router.push('/')
}
</script>
