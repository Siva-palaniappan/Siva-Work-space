<template>
  <v-container class="fill-height d-flex justify-center align-center" fluid>
    <v-row class="w-100" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 pa-md-8 rounded-xl text-center" elevation="10">
          <v-card-title class="text-h5 mb-2">
            SpendNest
          </v-card-title>
          <v-card-subtitle>
            Use the Expense and Category tabs above to get started.
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const userid = localStorage.getItem('spendnest_userid')
  if (!userid) {
    router.push('/login')
  }
})
</script>
