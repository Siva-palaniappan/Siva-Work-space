<template>
  <v-list>
    <v-list-item v-for="(event, i) in events" :key="i">
      <v-list-item-title>{{ event.title }}</v-list-item-title>
      <v-list-item-subtitle>{{ event.date }}</v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<script setup>
const events = [
  { title: "Team Meeting", date: "2025-08-20" },
  { title: "Client Demo", date: "2025-08-22" },
  { title: "Hackathon", date: "2025-08-25" },
]
</script>
