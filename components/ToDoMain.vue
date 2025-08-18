<template>
  <v-card class="pa-4">
    <v-card-title class="text-h6">
      ToDo Main
    </v-card-title>

    <!-- Tabs -->
    <v-tabs v-model="tab" color="primary" grow>
      <v-tab value="services">Services</v-tab>
      <v-tab value="events">Events</v-tab>
      <v-tab value="purchases">Purchases</v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-window v-model="tab" class="mt-4">
      <v-window-item value="services">
        <v-card flat class="pa-4">
          <service-list />
        </v-card>
      </v-window-item>

      <v-window-item value="events">
        <v-card flat class="pa-4">
          <event-list />
        </v-card>
      </v-window-item>

      <v-window-item value="purchases">
        <v-card flat class="pa-4">
          <purchase-list />
        </v-card>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup>
import { ref } from "vue"
import ServiceList from "@/components/ServiceList.vue"
import EventList from "@/components/EventList.vue"
import PurchaseList from "@/components/PurchaseList.vue"

const tab = ref("services") // default active tab
</script>
