<template>
  <v-container class="fill-height d-flex justify-center align-start pt-10" fluid>
    <v-row class="w-100" justify="center">
      <v-col cols="12" sm="10" md="6">
        <v-card class="pa-6 pa-md-8 rounded-xl" elevation="10">
          <v-card-title class="text-h5 text-center mb-6">
            Categories
          </v-card-title>

          <!-- Add category -->
          <div class="d-flex mb-2">
            <v-text-field
              v-model="newCategory"
              label="New Category"
              variant="outlined"
              class="mr-2"
              density="comfortable"
              clearable
              @keyup.enter="onAddCategory"
            />
            <v-btn color="primary" height="56" @click="onAddCategory">
              Add
            </v-btn>
          </div>

          <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" variant="tonal">
            {{ errorMessage }}
          </v-alert>

          <!-- View categories -->
          <v-list v-if="categories.length" lines="two">
            <v-list-item
              v-for="cat in categories"
              :key="cat.catid"
              :title="cat.category"
              :subtitle="`Created on ${formatDate(cat.createdon)}`"
            />
          </v-list>
          <p v-else class="text-center text-grey mt-6">No categories yet. Add one above.</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref<Array<{ catid: string; category: string; createdon: string; userid: string }>>([])
const newCategory = ref('')
const errorMessage = ref('')
let userid = ''

const formatDate = (value: string) => new Date(value).toLocaleDateString()

const loadCategories = async () => {
  categories.value = await $fetch('/categories', { query: { userid } })
}

const onAddCategory = async () => {
  errorMessage.value = ''
  const category = newCategory.value.trim()
  if (!category) return

  try {
    await $fetch('/categories', {
      method: 'POST',
      body: { userid, category },
    })
    newCategory.value = ''
    await loadCategories()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to add category'
  }
}

onMounted(() => {
  userid = localStorage.getItem('spendnest_userid') || ''
  if (!userid) {
    router.push('/login')
    return
  }
  loadCategories()
})
</script>
