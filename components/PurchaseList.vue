<template>
  <v-list>
    <v-list-item v-for="(purchase, i) in purchases" :key="i">
      <v-list-item-title>{{ purchase.item }}</v-list-item-title>
      <v-list-item-subtitle>₹ {{ purchase.amount }}</v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<script setup>
const purchases = [
  { item: "Laptop", amount: 65000 },
  { item: "Office Chair", amount: 12000 },
  { item: "Software License", amount: 4500 },
]
</script>
