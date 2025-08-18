<template>
  <v-list>
    <v-list-item
      v-for="(item, index) in items"
      :key="index"
      class="py-1"
    >
      <v-row align="center" class="w-100">
        <v-col cols="10">
          <v-text-field
            v-model="item.text"
            @blur="$emit('update', index)"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="2" class="text-right">
          <v-btn icon color="error" @click="$emit('delete', index)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
defineProps({
  items: Array
})

defineEmits(['delete', 'update'])
</script>
