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
            <v-btn color="primary" height="56" :loading="addingCategory" :disabled="addingCategory" @click="onAddCategory">
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
                <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditDialog(cat)" />
                <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="onDeleteCategory(cat)" />
              </template>
            </v-list-item>
          </v-list>
          <p v-else class="text-center text-grey mt-6">No categories yet. Add one above.</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit category popup -->
    <v-dialog v-model="editDialogOpen" max-width="380">
      <v-card class="pa-4 rounded-xl">
        <v-card-title>Edit Category</v-card-title>
        <v-card-text>
          <v-alert type="warning" density="compact" variant="tonal" class="mb-4">
            If you edit or delete a category, all data associated with that category will also be updated or deleted.
            Please be careful before performing this operation.
          </v-alert>

          <v-text-field
            v-model="editName"
            label="Category Name"
            variant="outlined"
            class="mb-2"
            clearable
          />
          <v-text-field
            v-model="editBudget"
            label="Monthly Budget"
            type="number"
            variant="outlined"
            hint="Leave blank to remove the budget"
            persistent-hint
            clearable
            @keyup.enter="onSaveEdit"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="savingEdit" @click="editDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" :loading="savingEdit" :disabled="savingEdit" @click="onSaveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete category popup -->
    <v-dialog v-model="deleteDialogOpen" max-width="380">
      <v-card class="pa-4 rounded-xl">
        <v-card-title>Delete Category</v-card-title>
        <v-card-text>
          <v-alert type="warning" density="compact" variant="tonal" class="mb-4">
            If you edit or delete a category, all data associated with that category will also be updated or deleted.
            Please be careful before performing this operation.
          </v-alert>
          <p>
            Delete <b>{{ deleteCategoryTarget?.category }}</b> and every expense recorded under it? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="deletingCategory" @click="deleteDialogOpen = false">Cancel</v-btn>
          <v-btn color="error" :loading="deletingCategory" :disabled="deletingCategory" @click="onConfirmDelete">Delete</v-btn>
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

const editDialogOpen = ref(false)
const editCategory = ref<Category | null>(null)
const editName = ref('')
const editBudget = ref('')

const deleteDialogOpen = ref(false)
const deleteCategoryTarget = ref<Category | null>(null)

const addingCategory = ref(false)
const savingEdit = ref(false)
const deletingCategory = ref(false)

let userid = ''

const loadCategories = async () => {
  categories.value = await $fetch('/categories', { query: { userid } })
}

const onAddCategory = async () => {
  errorMessage.value = ''
  const category = newCategory.value.trim()
  if (!category) return

  addingCategory.value = true
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
  } finally {
    addingCategory.value = false
  }
}

const openEditDialog = (cat: Category) => {
  editCategory.value = cat
  editName.value = cat.category
  editBudget.value = cat.budget != null ? String(cat.budget) : ''
  errorMessage.value = ''
  editDialogOpen.value = true
}

const onSaveEdit = async () => {
  if (!editCategory.value) return

  errorMessage.value = ''
  savingEdit.value = true
  try {
    await $fetch('/categories', {
      method: 'PUT',
      body: {
        userid,
        catid: editCategory.value.catid,
        category: editName.value.trim(),
        budget: editBudget.value || null,
      },
    })
    editDialogOpen.value = false
    await loadCategories()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to update category'
  } finally {
    savingEdit.value = false
  }
}

const onDeleteCategory = (cat: Category) => {
  deleteCategoryTarget.value = cat
  errorMessage.value = ''
  deleteDialogOpen.value = true
}

const onConfirmDelete = async () => {
  if (!deleteCategoryTarget.value) return

  errorMessage.value = ''
  deletingCategory.value = true
  try {
    await $fetch('/categories', {
      method: 'DELETE',
      query: { userid, catid: deleteCategoryTarget.value.catid },
    })
    deleteDialogOpen.value = false
    await loadCategories()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to delete category'
  } finally {
    deletingCategory.value = false
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
