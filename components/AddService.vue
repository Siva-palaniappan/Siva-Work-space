<template>
  <v-card class="pa-4" max-width="600">
    <v-card-title class="text-h6">Add Service</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submitService">
        <!-- Task -->
        <v-text-field v-model="service.task" label="Task" required />

        <!-- Description -->
        <v-textarea v-model="service.description" label="Description" rows="3" />

        <!-- To Be Done On -->
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
        >
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              v-model="service.tobedoneon"
              label="To Be Done On"
              readonly
            />
          </template>

          <v-date-picker
            v-model="service.tobedoneon"
            @update:model-value="menu = false"
          />
        </v-menu>

        <!-- Submit -->
        <v-btn type="submit" color="primary" class="mt-4">Add Service</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue"

const service = ref({
  task: "",
  description: "",
  tobedoneon: "",
})

const menu = ref(false)

async function submitService() {
  try {
    const response = await fetch("https://todowebapi-nc9p.onrender.com/api/service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service.value),
      
    })

    if (!response.ok) {
      throw new Error("Failed to add service")
    }

    alert("Service added successfully ✅")

    // reset form
    service.value = { task: "", description: "", tobedoneon: "" }
  } catch (error) {
    console.error("Error:", error)
    alert("Error adding service ❌")
  }
}
</script>
