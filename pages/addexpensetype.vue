<template>
  <v-container class="pa-6" max-width="600">
    <v-card class="pa-6 rounded-lg shadow-lg">
      <v-card-title class="text-h6 font-weight-bold">
        Add Expense Types
      </v-card-title>

      <v-row class="mt-4" align="center">
        <v-col cols="8">
          <v-text-field
            v-model="newExpense"
            label="Expense Type"
            variant="outlined"
            clearable
            @keyup.enter="addExpense"
          />
        </v-col>
        <v-col cols="4">
          <v-btn color="primary" block @click="addExpense">
            Add
          </v-btn>
        </v-col>
      </v-row>

      <!-- List of Added Expense Types -->
      <v-list v-if="expenses.length" class="mt-4">
        <v-list-item
          v-for="(expense, index) in expenses"
          :key="index"
        >
          <v-list-item-title>
            {{ expense.expenseTypeName || expense }}
          </v-list-item-title>
          <template #append>
            <v-btn
              icon="mdi-delete"
              color="error"
              variant="text"
              @click="removeExpense(index)"
            />
          </template>
        </v-list-item>
      </v-list>

      <!-- Confirm Button -->
      <v-card-actions class="mt-6">
        <v-btn
          color="success"
          block
          @click="confirmExpenses"
          :disabled="!expenses.length"
        >
          Confirm & Save
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar for duplicate -->
    <v-snackbar v-model="snackbar" color="error" timeout="2000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useExpenseApi } from "~/composables/useExpenseApi"

const { addExpenseType, getExpenseTypes, deleteExpenseType } = useExpenseApi()

const newExpense = ref("")
const expenses = ref<any[]>([])
const userId = 10

// Snackbar state
const snackbar = ref(false)
const snackbarMessage = ref("")

onMounted(async () => {
  expenses.value = await getExpenseTypes()
})

const addExpense = () => {
  if (!newExpense.value) return

  // Check duplicate (case-insensitive, trims spaces)
  const exists = expenses.value.some(
    (e) =>
      (e.expenseTypeName || e)
        .toString()
        .trim()
        .toLowerCase() === newExpense.value.trim().toLowerCase()
  )

  if (exists) {
    snackbarMessage.value = "This expense type already exists."
    snackbar.value = true
    return
  }

  expenses.value.push({ expenseTypeName: newExpense.value.trim(), userId })
  newExpense.value = ""
}

const removeExpense = (index: number) => {
  expenses.value.splice(index, 1)
}

const confirmExpenses = async () => {
  for (const exp of expenses.value) {
    if (!exp.primaryKeyId) {
      await addExpenseType(exp.expenseTypeName, exp.userId)
    }
  }
}
</script>
