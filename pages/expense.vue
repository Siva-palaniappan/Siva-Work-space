<template>
  <v-container class="fill-height d-flex justify-center align-start pt-10" fluid>
    <v-row class="w-100" justify="center">
      <v-col cols="12" sm="10" md="6">
        <v-card class="pa-6 pa-md-8 rounded-xl" elevation="10">
          <v-card-title class="text-h5 text-center mb-4">
            Expenses
          </v-card-title>

          <v-tabs v-model="tab" grow class="mb-4">
            <v-tab value="add">Add Expense</v-tab>
            <v-tab value="all">View All</v-tab>
            <v-tab value="total">View Total</v-tab>
          </v-tabs>

          <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" variant="tonal">
            {{ errorMessage }}
          </v-alert>

          <div v-if="tab === 'all' || tab === 'total'" class="d-flex align-center mb-4" style="gap: 8px;">
            <v-text-field
              v-model="dateFrom"
              label="From"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-text-field
              v-model="dateTo"
              label="To"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-btn variant="text" :disabled="!dateFrom && !dateTo" @click="clearDateFilter">Clear</v-btn>
          </div>

          <v-window v-model="tab">
            <!-- Add Expense -->
            <v-window-item value="add">
              <p v-if="!categories.length" class="text-center text-grey mt-6">
                No categories yet. <NuxtLink to="/category">Add one first</NuxtLink>.
              </p>
              <v-row v-else>
                <v-col
                  v-for="cat in categories"
                  :key="cat.catid"
                  cols="6"
                  sm="4"
                >
                  <v-card
                    class="pa-4 text-center rounded-lg"
                    variant="tonal"
                    color="primary"
                    @click="openAddDialog(cat)"
                  >
                    {{ cat.category }}
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- View All -->
            <v-window-item value="all">
              <v-list v-if="entries.length" lines="two">
                <v-list-item
                  v-for="item in entries"
                  :key="item.expenseid"
                  :title="`${item.category} — ${item.amount.toFixed(2)}`"
                  :subtitle="formatDate(item.dateofexpense)"
                >
                  <template #append>
                    <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditDialog(item)" />
                    <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="onDeleteExpense(item)" />
                  </template>
                </v-list-item>
              </v-list>
              <p v-else class="text-center text-grey mt-6">No expenses recorded yet.</p>
            </v-window-item>

            <!-- View Total -->
            <v-window-item value="total">
              <v-list v-if="totals.length" lines="one">
                <v-list-item
                  v-for="item in totals"
                  :key="item.catid"
                  :title="item.category"
                >
                  <template #append>
                    <span class="font-weight-medium">{{ item.amount.toFixed(2) }}</span>
                  </template>
                </v-list-item>
              </v-list>
              <p v-else class="text-center text-grey mt-6">No categories yet.</p>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add / Edit expense popup -->
    <v-dialog v-model="dialogOpen" max-width="400">
      <v-card class="pa-4 rounded-xl">
        <v-card-title>{{ editingEntry ? 'Edit' : 'Add' }} Expense</v-card-title>
        <v-card-text>
          <v-select
            v-if="editingEntry"
            v-model="selectedCategoryName"
            :items="categories.map(c => c.category)"
            label="Category"
            variant="outlined"
            class="mb-2"
          />
          <div v-else class="mb-2 text-subtitle-1">{{ dialogCategory?.category }}</div>

          <v-text-field
            v-model="expenseDate"
            label="Date"
            type="date"
            variant="outlined"
            class="mb-2"
          />

          <v-text-field
            v-model="amount"
            label="Amount"
            type="number"
            variant="outlined"
            autofocus
            @keyup.enter="onSubmitExpense"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" @click="onSubmitExpense">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Category {
  catid: string
  category: string
  createdon: string
  userid: string
}

interface ExpenseEntry {
  expenseid: string
  category: string
  amount: number
  dateofexpense: string
}

interface ExpenseTotal {
  catid: string
  category: string
  amount: number
}

const router = useRouter()
const tab = ref('add')
const categories = ref<Category[]>([])
const entries = ref<ExpenseEntry[]>([])
const totals = ref<ExpenseTotal[]>([])
const errorMessage = ref('')

const dialogOpen = ref(false)
const dialogCategory = ref<Category | null>(null)
const editingEntry = ref<ExpenseEntry | null>(null)
const selectedCategoryName = ref('')
const amount = ref('')
const expenseDate = ref('')

const dateFrom = ref('')
const dateTo = ref('')

let userid = ''

const todayStr = () => new Date().toISOString().slice(0, 10)

const formatDate = (value: string) => new Date(value).toLocaleDateString()

const loadCategories = async () => {
  categories.value = await $fetch('/categories', { query: { userid } })
}

const loadExpenses = async () => {
  const query: Record<string, string> = { userid }
  if (dateFrom.value) query.from = dateFrom.value
  if (dateTo.value) query.to = dateTo.value

  const data = await $fetch('/expenses', { query })
  entries.value = data.entries
  totals.value = data.totals
}

const clearDateFilter = () => {
  dateFrom.value = ''
  dateTo.value = ''
}

watch([dateFrom, dateTo], () => {
  if (!userid) return
  if (dateFrom.value && dateTo.value && dateFrom.value > dateTo.value) {
    errorMessage.value = '"From" date must be before "To" date.'
    return
  }
  errorMessage.value = ''
  loadExpenses()
})

const openAddDialog = (cat: Category) => {
  editingEntry.value = null
  dialogCategory.value = cat
  selectedCategoryName.value = cat.category
  amount.value = ''
  expenseDate.value = todayStr()
  errorMessage.value = ''
  dialogOpen.value = true
}

const openEditDialog = (entry: ExpenseEntry) => {
  editingEntry.value = entry
  dialogCategory.value = null
  selectedCategoryName.value = entry.category
  amount.value = String(entry.amount)
  expenseDate.value = entry.dateofexpense
  errorMessage.value = ''
  dialogOpen.value = true
}

const onSubmitExpense = async () => {
  errorMessage.value = ''
  const value = Number(amount.value)
  const category = selectedCategoryName.value

  if (!category || !Number.isFinite(value) || value <= 0) {
    errorMessage.value = 'Enter a valid amount.'
    return
  }
  if (!expenseDate.value) {
    errorMessage.value = 'Please choose a date.'
    return
  }

  try {
    if (editingEntry.value) {
      await $fetch('/expenses', {
        method: 'PUT',
        body: {
          userid,
          expenseid: editingEntry.value.expenseid,
          category,
          amount: value,
          dateofexpense: expenseDate.value,
        },
      })
    } else {
      await $fetch('/expenses', {
        method: 'POST',
        body: { userid, category, amount: value, dateofexpense: expenseDate.value },
      })
    }
    dialogOpen.value = false
    await loadExpenses()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to save expense'
  }
}

const onDeleteExpense = async (entry: ExpenseEntry) => {
  if (!confirm(`Delete this ${entry.category} expense of ${entry.amount}?`)) return

  errorMessage.value = ''
  try {
    await $fetch('/expenses', {
      method: 'DELETE',
      query: { userid, expenseid: entry.expenseid },
    })
    await loadExpenses()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to delete expense'
  }
}

onMounted(async () => {
  userid = localStorage.getItem('spendnest_userid') || ''
  if (!userid) {
    router.push('/login')
    return
  }
  await Promise.all([loadCategories(), loadExpenses()])
})
</script>
