<template>
  <div>
    <!-- Add Service Form -->
    <add-service class="mb-4" @service-added="fetchServices" />

    <!-- Service List -->
    <v-list v-if="services.length > 0">
      <v-list-item v-for="service in services" :key="service.id">
        <v-list-item-title>{{ service.task }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ service.description }} <br />
          <strong>To Be Done On:</strong> {{ formatDate(service.tobedoneon) }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <p v-else>No services found.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import AddService from "@/components/AddService.vue"

const services = ref([])

async function fetchServices() {
  try {
    const res = await fetch("https://localhost:7012/api/service")
    services.value = await res.json()
  } catch (err) {
    console.error("Error fetching services:", err)
  }
}

// Format date nicely
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

onMounted(fetchServices)
</script>
