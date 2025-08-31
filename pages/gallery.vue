<script setup lang="ts">
import { ref } from "vue"

const images = ref<string[]>([
  "https://picsum.photos/id/1011/400/300",
  "https://picsum.photos/id/1012/400/300",
  "https://picsum.photos/id/1013/400/300",
  "https://picsum.photos/id/1015/400/300",
  "https://picsum.photos/id/1016/400/300",
  "https://picsum.photos/id/1020/400/300",
  "https://picsum.photos/id/1021/400/300",
  "https://picsum.photos/id/1024/400/300"
])
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Gallery</h1>

    <!-- Force grid layout -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div
        v-for="(img, index) in images"
        :key="index"
        class="bg-gray-100 rounded-xl overflow-hidden shadow"
      >
        <img :src="img" alt="Gallery Image" class="w-full h-48 object-cover" />
      </div>
    </div>
  </div>
</template>
