<template>
  <nav class="bottom-nav">
    <NuxtLink to="/home" class="nav-item" :class="{ active: active === 'home' }">
      <i class="mdi mdi-home-variant-outline" /><span>Home</span>
    </NuxtLink>
    <button class="nav-item" :class="{ active: active === 'reports' }" @click="onComingSoon('Reports')">
      <i class="mdi mdi-chart-bar" /><span>Reports</span>
    </button>
    <button class="nav-item" :class="{ active: active === 'profile' }" @click="onComingSoon('Profile')">
      <i class="mdi mdi-account-outline" /><span>Profile</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ active?: 'home' | 'reports' | 'profile' | 'none' }>()

const onComingSoon = (label: string) => alert(`${label} is coming soon.`)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  background: #fff;
  border-top: 1px solid var(--border);
  padding: 10px 0 max(10px, env(safe-area-inset-bottom));
  z-index: 5;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  width: 96px;
}

.nav-item .mdi {
  font-size: 21px;
}

.nav-item.active {
  color: var(--green-600);
}
</style>
