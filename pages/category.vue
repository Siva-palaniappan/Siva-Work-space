<template>
  <v-container class="fill-height d-flex justify-center align-start pt-10" fluid>
    <v-row class="w-100" justify="center">
      <v-col cols="12" sm="10" md="6">
        <v-card class="pa-6 pa-md-8 rounded-xl" elevation="10">
          <v-card-title class="text-h5 text-center mb-6">
            Categories
          </v-card-title>

          <!-- Add category -->
          <div class="d-flex mb-2" style="gap: 8px;">
            <v-text-field
              v-model="newCategory"
              label="New Category"
              variant="outlined"
              density="comfortable"
              clearable
              @keyup.enter="onAddCategory"
            />
            <v-text-field
              v-model="newBudget"
              label="Monthly Budget (optional)"
              type="number"
              variant="outlined"
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
            >
              <template #subtitle>
                Created on {{ formatDate(cat.createdon) }} &middot;
                {{ cat.budget != null ? `Budget: ₹${cat.budget.toFixed(2)}/month` : 'No budget set' }}
              </template>
              <template #append>
                <v-btn icon="mdi-pencil" variant="text" size="small" @click="openBudgetDialog(cat)" />
              </template>
            </v-list-item>
          </v-list>
          <p v-else class="text-center text-grey mt-6">No categories yet. Add one above.</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit budget popup -->
    <v-dialog v-model="budgetDialogOpen" max-width="360">
      <v-card class="pa-4 rounded-xl">
        <v-card-title>Set Budget &mdash; {{ budgetDialogCategory?.category }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="budgetInput"
            label="Monthly Budget"
            type="number"
            variant="outlined"
            hint="Leave blank to remove the budget"
            persistent-hint
            autofocus
            @keyup.enter="onSaveBudget"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="budgetDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" @click="onSaveBudget">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '~/composables/useFormatDate'

interface Category {
  catid: string
  category: string
  createdon: string
  userid: string
  budget: number | null
}

const router = useRouter()
const categories = ref<Category[]>([])
const newCategory = ref('')
const newBudget = ref('')
const errorMessage = ref('')

const budgetDialogOpen = ref(false)
const budgetDialogCategory = ref<Category | null>(null)
const budgetInput = ref('')

let userid = ''

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
      body: { userid, category, budget: newBudget.value || null },
    })
    newCategory.value = ''
    newBudget.value = ''
    await loadCategories()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to add category'
  }
}

const openBudgetDialog = (cat: Category) => {
  budgetDialogCategory.value = cat
  budgetInput.value = cat.budget != null ? String(cat.budget) : ''
  errorMessage.value = ''
  budgetDialogOpen.value = true
}

const onSaveBudget = async () => {
  if (!budgetDialogCategory.value) return
  errorMessage.value = ''

  try {
    await $fetch('/categories', {
      method: 'PUT',
      body: { userid, catid: budgetDialogCategory.value.catid, budget: budgetInput.value || null },
    })
    budgetDialogOpen.value = false
    await loadCategories()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to update budget'
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
