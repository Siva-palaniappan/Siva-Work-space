<template>
  <div class="dash-wrap">
    <div class="phone">
      <header class="dash-topbar">
        <button class="icon-btn" aria-label="Menu" @click="onSignOut">
          <i class="mdi mdi-logout" />
        </button>
        <span class="brand">SpendNest</span>
        <div class="avatar">{{ initials }}</div>
      </header>

      <div class="greeting">
        <p class="hello">Hello, {{ username }} <span class="wave">👋</span></p>
        <p class="sub">Manage your home expenses easily</p>
      </div>

      <div class="summary-card">
        <div class="summary-top">
          <div>
            <p class="summary-eyebrow">This Month</p>
            <p class="summary-title">Total Expenses</p>
          </div>
          <span class="summary-badge"><i class="mdi mdi-trending-up" /></span>
        </div>
        <p class="summary-amount">{{ formatCurrency(monthSpent) }}</p>

        <div class="summary-detail">
          <div class="detail-col">
            <p class="detail-label">Spent</p>
            <p class="detail-value">{{ formatCurrency(monthSpent) }}</p>
          </div>
          <div class="detail-divider" />
          <div class="detail-col">
            <p class="detail-label">Budget Left</p>
            <p class="detail-value">{{ formatCurrency(budgetLeft) }}</p>
          </div>

          <div v-if="totalBudget > 0" class="summary-progress">
            <div class="summary-progress-bar">
              <div class="summary-progress-fill" :style="{ width: percentSpent + '%' }" />
            </div>
            <span class="summary-progress-caption">{{ Math.round(percentSpent) }}% of {{ formatCurrency(totalBudget) }}</span>
          </div>
        </div>
      </div>

      <section class="quick-access">
        <p class="section-title">Quick Access</p>
        <div class="quick-grid">
          <NuxtLink to="/expense" class="quick-card">
            <span class="quick-icon"><i class="mdi mdi-wallet-outline" /></span>
            <span class="quick-label">Expenses</span>
            <span class="quick-sub">Add &amp; manage</span>
          </NuxtLink>
          <NuxtLink to="/todo" class="quick-card">
            <span class="quick-icon"><i class="mdi mdi-clipboard-check-outline" /></span>
            <span class="quick-label">To-Do</span>
            <span class="quick-sub">Tasks &amp; todos</span>
          </NuxtLink>
        </div>
      </section>

      <section class="recent">
        <div class="recent-header">
          <p class="section-title">Recent Expenses</p>
          <NuxtLink to="/expense?tab=total" class="view-all">View All</NuxtLink>
        </div>

        <div v-if="recentEntries.length" class="recent-list">
          <NuxtLink
            v-for="item in recentEntries"
            :key="item.expenseid"
            to="/expense?tab=byDate"
            class="recent-row"
          >
            <span
              class="cat-icon"
              :style="{ background: categoryStyle(item.category).bg, color: categoryStyle(item.category).color }"
            >
              <i :class="'mdi ' + categoryStyle(item.category).icon" />
            </span>
            <span class="recent-info">
              <span class="recent-name">{{ item.category }}</span>
              <span class="recent-note">{{ item.description || formatDate(item.dateofexpense) }}</span>
            </span>
            <span class="recent-right">
              <span class="recent-amount">{{ formatCurrency(item.amount) }}</span>
              <i class="mdi mdi-chevron-right" />
            </span>
          </NuxtLink>
        </div>
        <p v-else class="empty-note">No expenses recorded yet.</p>
      </section>
    </div>

    <BottomNav active="home" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '~/composables/useFormatDate'
import { categoryStyle } from '~/composables/useCategoryStyle'

definePageMeta({ layout: 'auth' })

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

const router = useRouter()
const username = ref('there')
const entries = ref<ExpenseEntry[]>([])
const totals = ref<ExpenseTotal[]>([])

let userid = ''

const monthSpent = computed(() => totals.value.reduce((sum, t) => sum + t.monthSpent, 0))
const totalBudget = computed(() => totals.value.reduce((sum, t) => sum + (t.budget || 0), 0))
const budgetLeft = computed(() => Math.max(0, totalBudget.value - monthSpent.value))
const percentSpent = computed(() => (totalBudget.value > 0 ? Math.min(100, (monthSpent.value / totalBudget.value) * 100) : 0))

const recentEntries = computed(() => entries.value.slice(0, 3))
const initials = computed(() => username.value.trim().charAt(0).toUpperCase() || '?')

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`

const onSignOut = () => {
  localStorage.removeItem('spendnest_userid')
  localStorage.removeItem('spendnest_username')
  router.push('/')
}

onMounted(async () => {
  userid = localStorage.getItem('spendnest_userid') || ''
  if (!userid) {
    router.push('/login')
    return
  }
  username.value = localStorage.getItem('spendnest_username') || 'there'

  const data = await $fetch('/expenses', { query: { userid } })
  entries.value = data.entries
  totals.value = data.totals
})
</script>

<style scoped>
.dash-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--cream);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 24px 12px 0;
}

.phone {
  width: 420px;
  max-width: 100%;
  padding-bottom: 84px;
}

.dash-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.icon-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 22px;
  display: flex;
  cursor: pointer;
}

.brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--green-600);
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--green-600);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
}

.greeting {
  margin-bottom: 18px;
}

.hello {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
}

.sub {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}

.summary-card {
  background: var(--green-600);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 22px;
}

.summary-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.summary-eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--green-100);
}

.summary-title {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.summary-badge {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 17px;
}

.summary-amount {
  margin: 10px 0 16px;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.summary-detail {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-wrap: wrap;
}

.detail-col {
  flex: 1;
  min-width: 45%;
}

.detail-label {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.detail-value {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.detail-divider {
  width: 1px;
  background: var(--border);
  margin: 0 14px;
}

.summary-progress {
  width: 100%;
  margin-top: 12px;
}

.summary-progress-bar {
  height: 6px;
  border-radius: 4px;
  background: var(--border);
  overflow: hidden;
}

.summary-progress-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--green-600);
}

.summary-progress-caption {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}

.section-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.quick-access {
  margin-bottom: 22px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  text-decoration: none;
  text-align: left;
}

.quick-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--green-50);
  color: var(--green-800);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  margin-bottom: 6px;
}

.quick-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.quick-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.view-all {
  font-size: 13px;
  font-weight: 600;
  color: var(--green-600);
  text-decoration: none;
}

.recent-list {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

.recent-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  text-decoration: none;
  border-bottom: 1px solid var(--border);
}

.recent-row:last-child {
  border-bottom: none;
}

.cat-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.recent-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.recent-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.recent-note {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.recent-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.recent-right .mdi-chevron-right {
  color: var(--text-muted);
  font-size: 18px;
}

.empty-note {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 16px;
}
</style>
