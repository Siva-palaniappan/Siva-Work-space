<template>
  <div class="page-wrap">
    <div class="phone">
      <div class="header">
        <div class="header-top">
          <div>
            <p class="eyebrow">This month</p>
            <h1>Expenses</h1>
          </div>
          <div class="icon-badge"><i class="mdi mdi-feather" /></div>
        </div>
        <div class="header-total">
          <p>Total spent</p>
          <p>{{ formatCurrency(entriesTotal) }}</p>
        </div>
      </div>

      <div class="tabs">
        <button :class="['tab-btn', { active: tab === 'add' }]" @click="tab = 'add'">
          <i class="mdi mdi-plus" />Add
        </button>
        <button :class="['tab-btn', { active: tab === 'total' }]" @click="tab = 'total'">
          <i class="mdi mdi-chart-donut" />Total
        </button>
        <button :class="['tab-btn', 'date-tab', { active: tab === 'byDate' }]" @click="tab = 'byDate'">
          <i class="mdi mdi-calendar-month" />By date
        </button>
      </div>

      <v-alert v-if="errorMessage" type="error" density="compact" class="mx-3 mt-3" variant="tonal">
        {{ errorMessage }}
      </v-alert>

      <div v-if="tab === 'total' || tab === 'byDate'" class="date-filters">
        <label class="date-field">
          <i class="mdi mdi-calendar-blank" />
          <input v-model="dateFrom" type="date" aria-label="From date">
        </label>
        <label class="date-field">
          <i class="mdi mdi-calendar-blank" />
          <input v-model="dateTo" type="date" aria-label="To date">
        </label>
        <button class="clear-btn" aria-label="Clear dates" :disabled="!dateFrom && !dateTo" @click="clearDateFilter">
          <i class="mdi mdi-close" />
        </button>
      </div>

      <div v-if="tab === 'byDate'" class="view-edit-row">
        <div class="segmented">
          <button :class="{ active: dateViewMode === 'view' }" @click="dateViewMode = 'view'">
            <i class="mdi mdi-eye-outline" />View
          </button>
          <button :class="{ active: dateViewMode === 'edit' }" @click="dateViewMode = 'edit'">
            <i class="mdi mdi-pencil-outline" />Edit
          </button>
        </div>
      </div>

      <div class="list">
        <!-- Add Expense -->
        <template v-if="tab === 'add'">
          <p v-if="!categories.length" class="empty-note">
            No categories yet. <NuxtLink to="/category">Add one first</NuxtLink>.
          </p>
          <div v-else class="category-grid">
            <button
              v-for="cat in categories"
              :key="cat.catid"
              class="category-card"
              @click="openAddDialog(cat)"
            >
              <span
                class="cat-icon-lg"
                :style="{ background: categoryStyle(cat.category).bg, color: categoryStyle(cat.category).color }"
              >
                <i :class="'mdi ' + categoryStyle(cat.category).icon" />
              </span>
              <span>{{ cat.category }}</span>
            </button>
          </div>
        </template>

        <!-- View Total -->
        <template v-else-if="tab === 'total'">
          <div v-if="totals.length">
            <div v-for="item in totals" :key="item.catid" class="expense-row">
              <div
                class="cat-icon"
                :style="{ background: categoryStyle(item.category).bg, color: categoryStyle(item.category).color }"
              >
                <i :class="'mdi ' + categoryStyle(item.category).icon" />
              </div>
              <div class="expense-info">
                <p class="name">{{ item.category }}</p>
                <div v-if="item.budget" class="budget-bar-wrap">
                  <div class="budget-bar">
                    <div
                      class="budget-bar-fill"
                      :style="{ width: budgetPercent(item) + '%', background: budgetBarColor(item) }"
                    />
                  </div>
                  <span class="budget-caption">
                    {{ formatCurrency(item.monthSpent) }} / {{ formatCurrency(item.budget) }} this month
                  </span>
                </div>
              </div>
              <div class="expense-amount">{{ formatCurrency(item.amount) }}</div>
            </div>
          </div>
          <p v-else class="empty-note">No categories yet.</p>

          <div v-if="totals.length" class="total-bar">
            <span>Total</span>
            <span>{{ formatCurrency(categoriesTotal) }}</span>
          </div>
        </template>

        <!-- View by Date -->
        <template v-else-if="tab === 'byDate'">
          <template v-if="entriesByDate.length">
            <template v-for="group in entriesByDate" :key="group.date">
              <div class="date-divider">
                <span>{{ formatDate(group.date) }}</span>
                <div class="rule" />
                <span>{{ formatCurrency(group.total) }}</span>
              </div>
              <div
                v-for="item in group.entries"
                :key="item.expenseid"
                class="expense-row"
                :class="{ 'edit-mode': dateViewMode === 'edit' }"
              >
                <div
                  class="cat-icon"
                  :style="{ background: categoryStyle(item.category).bg, color: categoryStyle(item.category).color }"
                >
                  <i :class="'mdi ' + categoryStyle(item.category).icon" />
                </div>
                <div class="expense-info">
                  <p class="name">{{ item.category }}</p>
                  <p v-if="item.description" class="note">{{ item.description }}</p>
                </div>
                <div class="expense-amount">{{ formatCurrency(item.amount) }}</div>
                <div v-if="dateViewMode === 'edit'" class="row-actions">
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    class="edit-icon"
                    :disabled="deletingExpenseId === item.expenseid"
                    aria-label="Edit expense"
                    @click="openEditDialog(item)"
                  />
                  <v-btn
                    icon="mdi-trash-can-outline"
                    variant="text"
                    size="small"
                    class="delete-icon"
                    :loading="deletingExpenseId === item.expenseid"
                    :disabled="deletingExpenseId === item.expenseid"
                    aria-label="Delete expense"
                    @click="onDeleteExpense(item)"
                  />
                </div>
              </div>
            </template>

            <div class="total-bar">
              <span>Total, all dates</span>
              <span>{{ formatCurrency(entriesTotal) }}</span>
            </div>
          </template>
          <p v-else class="empty-note">No expenses recorded yet.</p>
        </template>
      </div>
    </div>

    <!-- Add / Edit expense popup -->
    <v-dialog v-model="dialogOpen" max-width="380">
      <div class="modal-card">
        <div class="modal-header">
          <span
            class="modal-cat-icon"
            :style="{ background: modalCategoryStyle.bg, color: modalCategoryStyle.color }"
          >
            <i :class="'mdi ' + modalCategoryStyle.icon" />
          </span>
          <div class="modal-header-text">
            <p class="modal-title">{{ editingEntry ? 'Edit Expense' : 'Add Expense' }}</p>
            <select v-if="editingEntry" v-model="selectedCatId" class="modal-select modal-select-inline">
              <option v-for="cat in categories" :key="cat.catid" :value="cat.catid">{{ cat.category }}</option>
            </select>
            <p v-else class="modal-category">{{ dialogCategory?.category }}</p>
          </div>
        </div>

        <label class="modal-label">Amount</label>
        <div class="amount-field">
          <span class="currency-sign">₹</span>
          <input
            v-model="amount"
            type="number"
            class="amount-input"
            autofocus
            @keyup.enter="onSubmitExpense"
          >
        </div>

        <label class="modal-label">Date</label>
        <input v-model="expenseDate" type="date" class="modal-input">

        <label class="modal-label">Description (optional)</label>
        <textarea v-model="description" class="modal-textarea" rows="2" placeholder="Add a note..." />

        <div class="modal-actions">
          <v-btn
            class="modal-btn solid"
            :loading="submittingExpense"
            :disabled="submittingExpense"
            @click="onSubmitExpense"
          >
            Save Expense
          </v-btn>
          <v-btn class="modal-btn ghost" variant="text" :disabled="submittingExpense" @click="dialogOpen = false">
            Cancel
          </v-btn>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '~/composables/useFormatDate'

interface Category {
  catid: string
  category: string
  createdon: string
  userid: string
}

interface ExpenseEntry {
  expenseid: string
  catid: string
  category: string
  amount: number
  description: string
  dateofexpense: string
}

interface ExpenseTotal {
  catid: string
  category: string
  amount: number
  budget: number | null
  monthSpent: number
}

interface DateGroup {
  date: string
  entries: ExpenseEntry[]
  total: number
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
const selectedCatId = ref('')
const amount = ref('')
const expenseDate = ref('')
const description = ref('')
const submittingExpense = ref(false)
const deletingExpenseId = ref<string | null>(null)

const dateFrom = ref('')
const dateTo = ref('')
const dateViewMode = ref<'view' | 'edit'>('view')

let userid = ''

const entriesTotal = computed(() => entries.value.reduce((sum, e) => sum + e.amount, 0))
const categoriesTotal = computed(() => totals.value.reduce((sum, t) => sum + t.amount, 0))

const entriesByDate = computed<DateGroup[]>(() => {
  const groups = new Map<string, ExpenseEntry[]>()
  for (const entry of entries.value) {
    if (!groups.has(entry.dateofexpense)) groups.set(entry.dateofexpense, [])
    groups.get(entry.dateofexpense)!.push(entry)
  }
  return Array.from(groups.entries()).map(([date, list]) => ({
    date,
    entries: list,
    total: list.reduce((sum, e) => sum + e.amount, 0),
  }))
})

const todayStr = () => new Date().toISOString().slice(0, 10)

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`

interface CategoryStyle {
  icon: string
  bg: string
  color: string
}

const CATEGORY_ICON_MAP: Array<{ match: RegExp } & CategoryStyle> = [
  { match: /veg/i, icon: 'mdi-carrot', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { match: /fruit/i, icon: 'mdi-food-apple-outline', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { match: /grocer/i, icon: 'mdi-cart-outline', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  { match: /milk|dairy/i, icon: 'mdi-cup-outline', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  { match: /transport|fuel|petrol|gas|car/i, icon: 'mdi-gas-station-outline', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  { match: /rent|house|home/i, icon: 'mdi-home-outline', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { match: /health|medic|pharma/i, icon: 'mdi-medical-bag', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  { match: /entertain|movie|game/i, icon: 'mdi-movie-outline', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { match: /outside|restaurant|food|eat/i, icon: 'mdi-silverware-fork-knife', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
]

const FALLBACK_PALETTE: CategoryStyle[] = [
  { icon: 'mdi-wallet-outline', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { icon: 'mdi-wallet-outline', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
]

const categoryStyle = (name: string): CategoryStyle => {
  const found = CATEGORY_ICON_MAP.find(m => m.match.test(name))
  if (found) return found
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % FALLBACK_PALETTE.length
  return FALLBACK_PALETTE[idx]
}

const activeCategory = computed<Category | null>(() => {
  if (editingEntry.value) {
    return categories.value.find(c => c.catid === selectedCatId.value) || null
  }
  return dialogCategory.value
})

const modalCategoryStyle = computed(() => categoryStyle(activeCategory.value?.category || ''))

const budgetPercent = (item: ExpenseTotal) => {
  if (!item.budget) return 0
  return Math.min(100, (item.monthSpent / item.budget) * 100)
}

const budgetBarColor = (item: ExpenseTotal) => {
  if (!item.budget) return 'var(--green-400)'
  const ratio = item.monthSpent / item.budget
  if (ratio >= 1) return '#b23a3a'
  if (ratio >= 0.8) return 'var(--amber-200)'
  return 'var(--green-400)'
}

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
  selectedCatId.value = cat.catid
  amount.value = ''
  expenseDate.value = todayStr()
  description.value = ''
  errorMessage.value = ''
  dialogOpen.value = true
}

const openEditDialog = (entry: ExpenseEntry) => {
  editingEntry.value = entry
  dialogCategory.value = null
  selectedCatId.value = entry.catid
  amount.value = String(entry.amount)
  expenseDate.value = entry.dateofexpense
  description.value = entry.description
  errorMessage.value = ''
  dialogOpen.value = true
}

const onSubmitExpense = async () => {
  errorMessage.value = ''
  const value = Number(amount.value)
  const catid = activeCategory.value?.catid

  if (!catid || !Number.isFinite(value) || value <= 0) {
    errorMessage.value = 'Enter a valid amount.'
    return
  }
  if (!expenseDate.value) {
    errorMessage.value = 'Please choose a date.'
    return
  }

  submittingExpense.value = true
  try {
    if (editingEntry.value) {
      await $fetch('/expenses', {
        method: 'PUT',
        body: {
          userid,
          expenseid: editingEntry.value.expenseid,
          catid,
          amount: value,
          dateofexpense: expenseDate.value,
          description: description.value,
        },
      })
    } else {
      await $fetch('/expenses', {
        method: 'POST',
        body: { userid, catid, amount: value, dateofexpense: expenseDate.value, description: description.value },
      })
    }
    dialogOpen.value = false
    await loadExpenses()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to save expense'
  } finally {
    submittingExpense.value = false
  }
}

const onDeleteExpense = async (entry: ExpenseEntry) => {
  if (!confirm(`Delete this ${entry.category} expense of ${entry.amount}?`)) return

  errorMessage.value = ''
  deletingExpenseId.value = entry.expenseid
  try {
    await $fetch('/expenses', {
      method: 'DELETE',
      query: { userid, expenseid: entry.expenseid },
    })
    await loadExpenses()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to delete expense'
  } finally {
    deletingExpenseId.value = null
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

<style scoped>
.page-wrap {
  min-height: 100%;
  display: flex;
  justify-content: center;
  padding: 24px 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.phone {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.header {
  background: var(--green-600);
  padding: 20px 18px 16px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-top .eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--green-100);
}

.header-top h1 {
  margin: 2px 0 0;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
}

.icon-badge {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 19px;
}

.header-total {
  margin-top: 16px;
}

.header-total p:first-child {
  margin: 0;
  font-size: 13px;
  color: var(--green-100);
}

.header-total p:last-child {
  margin: 2px 0 0;
  font-size: 30px;
  font-weight: 600;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.tabs {
  display: flex;
  gap: 6px;
  padding: 12px 14px 0;
}

.tab-btn {
  flex: 1;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  padding: 9px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  transition: background 0.15s, color 0.15s;
}

.tab-btn.active {
  background: var(--green-600);
  color: #fff;
  border-color: var(--green-600);
}

.tab-btn.active.date-tab {
  background: var(--green-50);
  color: var(--green-800);
  border-color: var(--green-50);
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 14px 0;
}

.date-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 7px 10px;
  font-size: 12px;
  color: var(--text-muted);
}

.date-field input {
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--text-primary);
  width: 100%;
  outline: none;
  font-family: inherit;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 15px;
  cursor: pointer;
  display: flex;
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.view-edit-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 14px 4px;
}

.segmented {
  display: flex;
  background: var(--cream);
  border-radius: var(--radius);
  padding: 3px;
  border: 1px solid var(--border);
}

.segmented button {
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 14px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.15s, color 0.15s;
}

.segmented button.active {
  background: var(--green-50);
  color: var(--green-800);
}

.list {
  padding: 4px 14px 8px;
}

.empty-note {
  text-align: center;
  color: var(--text-muted);
  margin-top: 24px;
  font-size: 13px;
}

.date-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 8px;
}

.date-divider span:first-child {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.date-divider .rule {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.date-divider span:last-child {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.expense-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--border);
}

.date-divider + .expense-row {
  border-top: none;
}

.cat-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
}

.expense-info {
  flex: 1;
  min-width: 0;
}

.expense-info .name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.expense-info .note {
  margin: 1px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.budget-bar-wrap {
  margin-top: 6px;
}

.budget-bar {
  height: 6px;
  border-radius: 4px;
  background: var(--border);
  overflow: hidden;
}

.budget-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.2s ease;
}

.budget-caption {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.expense-amount {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.expense-row.edit-mode .expense-amount {
  display: none;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
}

.row-actions button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  padding: 4px;
}

.row-actions .edit-icon {
  color: var(--green-600);
}

.row-actions .delete-icon {
  color: #b23a3a;
}

.total-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: var(--green-50);
  margin: 12px 0;
  border-radius: 12px;
}

.total-bar span:first-child {
  font-size: 13px;
  font-weight: 500;
  color: var(--green-800);
}

.total-bar span:last-child {
  font-size: 17px;
  font-weight: 600;
  color: var(--green-800);
  font-variant-numeric: tabular-nums;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-top: 8px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--cream);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  transition: background 0.15s, border-color 0.15s;
}

.category-card:hover {
  background: var(--green-50);
  border-color: var(--green-50);
}

.cat-icon-lg {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(4, 52, 44, 0.18);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.modal-cat-icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  flex-shrink: 0;
}

.modal-header-text {
  min-width: 0;
}

.modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-category {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--green-800);
}

.modal-select-inline {
  margin-top: 2px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--green-800);
  padding: 0;
  cursor: pointer;
}

.modal-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  margin: 14px 0 6px;
}

.amount-field {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid var(--green-100);
  border-radius: 12px;
  padding: 10px 14px;
  background: var(--green-50);
}

.currency-sign {
  font-size: 20px;
  font-weight: 700;
  color: var(--green-800);
}

.amount-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 22px;
  font-weight: 700;
  color: var(--green-800);
  font-family: inherit;
  min-width: 0;
}

.modal-input,
.modal-select,
.modal-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 9px 12px;
  font-size: 13px;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  background: #fff;
  transition: border-color 0.15s;
}

.modal-input:focus,
.modal-select:focus,
.modal-textarea:focus,
.amount-field:focus-within {
  border-color: var(--green-600);
}

.modal-textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 22px;
}

.modal-btn {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  width: 100%;
}

.modal-btn.ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border);
}

.modal-btn.solid {
  background: var(--green-600);
  color: #fff;
  box-shadow: 0 8px 16px rgba(15, 110, 86, 0.25);
}
</style>

<style>
:root {
  --green-900: #04342c;
  --green-800: #085041;
  --green-600: #0f6e56;
  --green-400: #1d9e75;
  --green-200: #9fe1cb;
  --green-100: #c0dd97;
  --green-50: #e1f5ee;
  --amber-50: #faeeda;
  --amber-200: #ef9f27;
  --amber-800: #633806;
  --cream: #f7f4ee;
  --text-primary: #2c2c2a;
  --text-secondary: #5f5e5a;
  --text-muted: #888780;
  --border: #e5e2d9;
  --radius: 10px;
}
</style>
