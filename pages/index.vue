<template>
  <div class="landing">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" v-html="logoSvg" />
        <span class="brand-word">spend<b>Nest</b></span>
      </div>
      <div class="topbar-actions">
        <NuxtLink to="/login" class="btn btn-ghost">Login</NuxtLink>
        <NuxtLink to="/signup" class="btn btn-solid">Sign Up</NuxtLink>
      </div>
    </header>

    <main class="hero">
      <div class="hero-mark" v-html="logoSvg" />
      <h1 class="wordmark">spend<b>Nest</b></h1>
      <p class="tagline">Spend wisely, save gently, live fully.</p>

      <ul class="features">
        <li v-for="f in features" :key="f.title">
          <span class="feature-icon"><v-icon :icon="f.icon" size="22" /></span>
          <span class="feature-copy">
            <span class="feature-title">{{ f.title }}</span>
            <span class="feature-desc">{{ f.desc }}</span>
          </span>
        </li>
      </ul>
    </main>

    <div class="decor-leaf" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const userid = localStorage.getItem('spendnest_userid')
  if (userid) {
    router.push('/home')
  }
})

const features = [
  { icon: 'mdi-chart-line', title: 'Track Expenses', desc: 'Know where your money goes' },
  { icon: 'mdi-target', title: 'Set Goals', desc: 'Plan today for a better tomorrow' },
  { icon: 'mdi-piggy-bank-outline', title: 'Save More', desc: 'Build healthy habits and grow your savings' },
  { icon: 'mdi-bell-ring-outline', title: 'Smart Alerts', desc: 'Get notified. Stay in control.' },
]

const logoSvg = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 62 C 14 46, 86 46, 86 62 C 68 54, 32 54, 14 62 Z" fill="#2F6B3D"/>
  <path d="M20 66 C 20 54, 80 54, 80 66 C 64 60, 36 60, 20 66 Z" fill="#3E8149"/>
  <path d="M50 20 C 40 20, 33 28, 33 38 C 33 47, 40 54, 49 55 L 45 60 L 54 58 C 63 56, 69 48, 69 38 C 69 27, 61 20, 50 20 Z" fill="#2F6B3D"/>
  <circle cx="58" cy="33" r="2.6" fill="#F5F1E8"/>
  <path d="M69 36 L 78 33 L 70 41 Z" fill="#2F6B3D"/>
  <path d="M35 30 C 28 24, 20 26, 16 33 C 24 33, 30 33, 35 30 Z" fill="#4C9457"/>
</svg>
`
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f1e8;
  color: #1f2420;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  z-index: 2;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2420;
}

.brand-mark {
  width: 26px;
  height: 26px;
  display: inline-flex;
}

.brand-mark :deep(svg) {
  width: 100%;
  height: 100%;
}

.brand-word b {
  color: #2f6b3d;
  font-weight: 700;
}

.topbar-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.btn:hover {
  opacity: 0.85;
}

.btn:focus-visible {
  outline: 2px solid #2f6b3d;
  outline-offset: 2px;
}

.btn-ghost {
  color: #2f6b3d;
  border: 1.5px solid #2f6b3d;
  background: transparent;
}

.btn-solid {
  color: #f5f1e8;
  background: #2f6b3d;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 28px 120px;
  z-index: 2;
}

.hero-mark {
  width: 96px;
  height: 96px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.hero-mark :deep(svg) {
  width: 100%;
  height: 100%;
}

.wordmark {
  font-size: 2.1rem;
  font-weight: 700;
  margin: 4px 0 6px;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.wordmark b {
  color: #2f6b3d;
  font-weight: 700;
}

.tagline {
  font-size: 1rem;
  color: #4b5148;
  margin: 0 0 36px;
  max-width: 26ch;
}

.features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  max-width: 360px;
  text-align: left;
}

.features li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.feature-icon {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2f6b3d;
  color: #f5f1e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 2px;
}

.feature-title {
  font-weight: 700;
  font-size: 0.98rem;
  color: #1f2420;
}

.feature-desc {
  font-size: 0.85rem;
  color: #6b7268;
}

.decor-leaf {
  position: absolute;
  left: -40px;
  bottom: -40px;
  width: 220px;
  height: 220px;
  background:
    radial-gradient(ellipse at 30% 30%, rgba(76, 148, 87, 0.28), transparent 60%),
    radial-gradient(ellipse at 60% 70%, rgba(47, 107, 61, 0.22), transparent 55%);
  filter: blur(2px);
  pointer-events: none;
  z-index: 1;
}

@media (min-width: 640px) {
  .hero {
    padding-bottom: 80px;
  }
}
</style>
