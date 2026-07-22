<template>
  <div class="page-wrap">
    <div class="phone">
      <div class="header">
        <div class="header-top">
          <div>
            <p class="eyebrow">Your tasks</p>
            <h1>To-Do</h1>
          </div>
          <div class="icon-badge"><i class="mdi mdi-clipboard-check-outline" /></div>
        </div>
        <div class="header-total">
          <p>Open tasks</p>
          <p>{{ openCount }}</p>
        </div>
      </div>

      <div class="filter-row">
        <div class="segmented status-filter">
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
          <button
            v-for="s in STATUS_LIST"
            :key="s"
            :class="{ active: filter === s }"
            :style="filter === s ? { background: STATUS_META[s].bg, color: STATUS_META[s].color } : {}"
            @click="filter = s"
          >
            {{ STATUS_META[s].label }}
          </button>
        </div>
        <button class="add-btn" @click="openAddDialog">
          <i class="mdi mdi-plus" />Add Task
        </button>
      </div>

      <v-alert v-if="errorMessage" type="error" density="compact" class="mx-3 mt-3" variant="tonal">
        {{ errorMessage }}
      </v-alert>

      <div class="list">
        <div v-if="filteredTodos.length">
          <div
            v-for="item in filteredTodos"
            :key="item.todoid"
            class="todo-row"
            :style="{ borderLeftColor: STATUS_META[item.status].color }"
          >
            <select
              class="status-select"
              :style="{ background: STATUS_META[item.status].bg, color: STATUS_META[item.status].color }"
              :value="item.status"
              :disabled="updatingId === item.todoid"
              @change="onStatusChange(item, $event.target.value)"
            >
              <option v-for="s in STATUS_LIST" :key="s" :value="s">{{ STATUS_META[s].label }}</option>
            </select>

            <div class="todo-info">
              <p class="todo-title" :class="{ done: item.status === 'COMPLETED' }">{{ item.title }}</p>
              <p v-if="item.notes" class="todo-notes">{{ item.notes }}</p>
              <span v-if="item.duedate" class="todo-due">
                <i class="mdi mdi-calendar-blank" />{{ formatDate(item.duedate) }}
              </span>
            </div>

            <div class="row-actions">
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                size="small"
                class="edit-icon"
                :disabled="deletingId === item.todoid"
                aria-label="Edit task"
                @click="openEditDialog(item)"
              />
              <v-btn
                icon="mdi-trash-can-outline"
                variant="text"
                size="small"
                class="delete-icon"
                :loading="deletingId === item.todoid"
                :disabled="deletingId === item.todoid"
                aria-label="Delete task"
                @click="onDeleteTodo(item)"
              />
            </div>
          </div>
        </div>
        <p v-else class="empty-note">
          {{ filter === 'all' ? 'No tasks yet. Add one above.' : `No ${STATUS_META[filter].label.toLowerCase()} tasks.` }}
        </p>
      </div>
    </div>

    <!-- Add / Edit task popup -->
    <v-dialog v-model="dialogOpen" max-width="380">
      <div class="modal-card">
        <p class="modal-title">{{ editingTodo ? 'Edit Task' : 'Add Task' }}</p>

        <label class="modal-label">Title</label>
        <input v-model="title" type="text" class="modal-input" autofocus placeholder="What needs to be done?" @keyup.enter="onSubmitTodo">

        <label class="modal-label">Due date (optional)</label>
        <input v-model="dueDate" type="date" class="modal-input">

        <label class="modal-label">Notes (optional)</label>
        <textarea v-model="notes" class="modal-textarea" rows="2" placeholder="Add a note..." />

        <div class="modal-actions">
          <v-btn class="modal-btn solid" :loading="submitting" :disabled="submitting" @click="onSubmitTodo">
            Save Task
          </v-btn>
          <v-btn class="modal-btn ghost" variant="text" :disabled="submitting" @click="dialogOpen = false">
            Cancel
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <BottomNav active="none" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '~/composables/useFormatDate'

definePageMeta({ layout: 'auth' })

type TodoStatus = 'NEW' | 'HOLD' | 'INPROGRESS' | 'COMPLETED'

interface TodoItem {
  todoid: string
  userid: string
  title: string
  notes: string
  duedate: string | null
  status: TodoStatus
  createdon: string
}

const STATUS_LIST: TodoStatus[] = ['NEW', 'HOLD', 'INPROGRESS', 'COMPLETED']
const STATUS_META: Record<TodoStatus, { label: string; bg: string; color: string }> = {
  NEW: { label: 'New', bg: '#e7e3fa', color: '#5b3fa0' },
  HOLD: { label: 'Hold', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  INPROGRESS: { label: 'In Progress', bg: '#dcedfd', color: '#1d5fae' },
  COMPLETED: { label: 'Completed', bg: 'var(--green-50)', color: 'var(--green-800)' },
}

const router = useRouter()
const todos = ref<TodoItem[]>([])
const filter = ref<TodoStatus | 'all'>('all')
const errorMessage = ref('')

const dialogOpen = ref(false)
const editingTodo = ref<TodoItem | null>(null)
const title = ref('')
const dueDate = ref('')
const notes = ref('')
const submitting = ref(false)
const updatingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

let userid = ''

const openCount = computed(() => todos.value.filter(t => t.status !== 'COMPLETED').length)

const filteredTodos = computed(() => {
  if (filter.value === 'all') return todos.value
  return todos.value.filter(t => t.status === filter.value)
})

const loadTodos = async () => {
  todos.value = await $fetch('/todos', { query: { userid } })
}

const openAddDialog = () => {
  editingTodo.value = null
  title.value = ''
  dueDate.value = ''
  notes.value = ''
  errorMessage.value = ''
  dialogOpen.value = true
}

const openEditDialog = (item: TodoItem) => {
  editingTodo.value = item
  title.value = item.title
  dueDate.value = item.duedate || ''
  notes.value = item.notes
  errorMessage.value = ''
  dialogOpen.value = true
}

const onSubmitTodo = async () => {
  errorMessage.value = ''
  const value = title.value.trim()
  if (!value) {
    errorMessage.value = 'Please enter a task title.'
    return
  }

  submitting.value = true
  try {
    if (editingTodo.value) {
      await $fetch('/todos', {
        method: 'PUT',
        body: { userid, todoid: editingTodo.value.todoid, title: value, notes: notes.value, duedate: dueDate.value },
      })
    } else {
      await $fetch('/todos', {
        method: 'POST',
        body: { userid, title: value, notes: notes.value, duedate: dueDate.value },
      })
    }
    dialogOpen.value = false
    await loadTodos()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to save task'
  } finally {
    submitting.value = false
  }
}

const onStatusChange = async (item: TodoItem, status: string) => {
  errorMessage.value = ''
  updatingId.value = item.todoid
  try {
    await $fetch('/todos', {
      method: 'PUT',
      body: { userid, todoid: item.todoid, status },
    })
    await loadTodos()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to update task'
  } finally {
    updatingId.value = null
  }
}

const onDeleteTodo = async (item: TodoItem) => {
  if (!confirm(`Delete "${item.title}"?`)) return

  errorMessage.value = ''
  deletingId.value = item.todoid
  try {
    await $fetch('/todos', {
      method: 'DELETE',
      query: { userid, todoid: item.todoid },
    })
    await loadTodos()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to delete task'
  } finally {
    deletingId.value = null
  }
}

onMounted(async () => {
  userid = localStorage.getItem('spendnest_userid') || ''
  if (!userid) {
    router.push('/login')
    return
  }
  await loadTodos()
})
</script>

<style scoped>
.page-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 12px 84px;
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

.filter-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 14px 14px 0;
}

.segmented {
  display: flex;
  background: var(--cream);
  border-radius: var(--radius);
  padding: 3px;
  border: 1px solid var(--border);
}

.status-filter {
  flex-wrap: wrap;
}

.segmented button {
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.segmented button.active {
  background: var(--green-50);
  color: var(--green-800);
}

.add-btn {
  align-self: flex-end;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  border-radius: var(--radius);
  background: var(--green-600);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 9px 12px;
  cursor: pointer;
  white-space: nowrap;
}

.list {
  padding: 14px 14px 8px;
}

.empty-note {
  text-align: center;
  color: var(--text-muted);
  margin-top: 24px;
  font-size: 13px;
}

.todo-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 10px 12px 12px;
  margin: 8px 0;
  border-top: none;
  border-left: 3px solid transparent;
  border-radius: 8px;
  background: var(--cream);
}

.status-select {
  flex-shrink: 0;
  margin-top: 1px;
  border: none;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
}

.status-select:disabled {
  opacity: 0.6;
  cursor: default;
}

.todo-info {
  flex: 1;
  min-width: 0;
}

.todo-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.todo-title.done {
  color: var(--text-muted);
  text-decoration: line-through;
}

.todo-notes {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.todo-due {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--green-800);
  background: var(--green-50);
  border-radius: 6px;
  padding: 2px 6px;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
  flex-shrink: 0;
}

.row-actions .edit-icon {
  color: var(--green-600);
}

.row-actions .delete-icon {
  color: #b23a3a;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(4, 52, 44, 0.18);
}

.modal-title {
  margin: 0 0 18px;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
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

.modal-label:first-of-type {
  margin-top: 0;
}

.modal-input,
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
.modal-textarea:focus {
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
