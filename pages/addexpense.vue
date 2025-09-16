<template>
  <v-container class="pa-6" max-width="800">
    <v-card class="pa-6 rounded-lg shadow-lg">
      <v-card-title class="text-h6 font-weight-bold">
        Add Expenses
      </v-card-title>

      <!-- Expense Input Row -->
      <v-row class="mt-4" align="center">
        <!-- Autocomplete for Expense Type -->
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="selectedExpenseType"
            :items="expenseTypes"
            item-title="expenseTypeName"
            item-value="expenseTypeName"
            label="Expense Type"
            variant="outlined"
            clearable
          />
        </v-col>

        <!-- Description -->
        <v-col cols="12" md="3">
          <v-textarea
            v-model="description"
            label="Description"
            rows="1"
            auto-grow
            variant="outlined"
          />
        </v-col>

        <!-- Amount -->
        <v-col cols="12" md="2">
          <v-text-field
            v-model="amount"
            label="Amount"
            type="number"
            variant="outlined"
          />
        </v-col>

        <!-- Date Picker -->
        <v-col cols="12" md="2">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="date"
                label="Date"
                readonly
                v-bind="props"
                variant="outlined"
              />
            </template>
            <v-date-picker v-model="date" @update:model-value="dateMenu = false" />
          </v-menu>
        </v-col>

        <!-- Add Button -->
        <v-col cols="12" md="2">
          <v-btn color="primary" block @click="addExpenseItem">
            Add
          </v-btn>
        </v-col>
      </v-row>

      <!-- Expenses Grid -->
      <v-table v-if="expenses.length" class="mt-6">
        <thead>
          <tr>
            <th class="text-left">Expense Type</th>
            <th class="text-left">Description</th>
            <th class="text-left">Amount</th>
            <th class="text-left">Date</th>
            <th class="text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(exp, index) in expenses" :key="index">
            <td>{{ exp.expenseType }}</td>
            <td>{{ exp.description }}</td>
            <td>{{ exp.amount }}</td>
            <td>{{ exp.date }}</td>
            <td>
              <v-btn
                icon="mdi-delete"
                color="error"
                variant="text"
                @click="removeExpense(index)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>

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

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" color="error" timeout="2000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useExpenseApi } from "~/composables/useExpenseApi"

const { getExpenseTypes, addExpense } = useExpenseApi()

// State
const expenseTypes = ref<any[]>([])
const selectedExpenseType = ref("")
const description = ref("")
const amount = ref("")
const date = ref("") // will hold YYYY-MM-DD from v-date-picker
const dateMenu = ref(false) // controls v-menu
const expenses = ref<any[]>([])

// Snackbar
const snackbar = ref(false)
const snackbarMessage = ref("")

onMounted(async () => {
  expenseTypes.value = await getExpenseTypes()
})

const addExpenseItem = () => {
  if (!selectedExpenseType.value || !amount.value || !date.value) {
    snackbarMessage.value = "Please fill all fields (type, amount, date)."
    snackbar.value = true
    return
  }

  const exists = expenses.value.some(
    (exp) =>
      exp.expenseType.trim().toLowerCase() ===
        selectedExpenseType.value.trim().toLowerCase() &&
      exp.date === date.value
  )
  if (exists) {
    snackbarMessage.value =
      "This expense type is already added for the selected date."
    snackbar.value = true
    return
  }

  expenses.value.push({
    expenseType: selectedExpenseType.value,
    description: description.value,
    amount: parseFloat(amount.value),
    date: date.value,
  })

  // Clear inputs
  selectedExpenseType.value = ""
  description.value = ""
  amount.value = ""
  date.value = ""
}

const removeExpense = (index: number) => {
  expenses.value.splice(index, 1)
}

const confirmExpenses = async () => {
  for (const exp of expenses.value) {
    await addExpense(exp.expenseType, exp.description, exp.amount, exp.date)
  }
  snackbarMessage.value = "Expenses saved successfully!"
  snackbar.value = true
  expenses.value = []
}
</script>
