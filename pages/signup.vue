<template>
  <v-container class="fill-height d-flex justify-center align-center" fluid>
    <v-card
      class="pa-8 rounded-xl"
      max-width="450"
      elevation="10"
    >
      <!-- Title -->
      <v-card-title class="text-h5 text-center mb-6">
        Create Your Account
      </v-card-title>

      <!-- Name -->
      <v-text-field
        v-model="name"
        label="Full Name"
        variant="outlined"
        class="mb-4"
        clearable
      />

      <!-- Email -->
      <v-text-field
        v-model="email"
        label="Email Address"
        type="email"
        variant="outlined"
        class="mb-4"
        clearable
      />

      <!-- Phone -->
      <v-text-field
        v-model="phone"
        label="Phone Number"
        type="tel"
        variant="outlined"
        class="mb-4"
        clearable
      />

      <!-- Password -->
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        variant="outlined"
        class="mb-1"
        clearable
        hint="At least 7 characters"
      />
      <div v-if="password" class="mb-4 px-1">
        <v-progress-linear
          :model-value="passwordStrength.score * 25"
          :color="passwordStrength.color"
          height="6"
          rounded
        />
        <span class="text-caption" :class="`text-${passwordStrength.color}`">
          {{ passwordStrength.label }}
        </span>
      </div>

      <!-- Confirm Password -->
      <v-text-field
        v-model="confirmPassword"
        label="Confirm Password"
        type="password"
        variant="outlined"
        class="mb-4"
        clearable
      />

      <!-- Error -->
      <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" variant="tonal">
        {{ errorMessage }}
      </v-alert>

      <!-- Signup Button -->
      <v-btn
        block
        color="primary"
        class="mb-4"
        @click="onSignup"
      >
        Sign Up
      </v-btn>

      <!-- Already have an account -->
      <div class="text-center">
        <span class="text-caption">Already have an account? </span>
        <NuxtLink to="/login" class="text-blue font-weight-medium">
          Login
        </NuxtLink>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({ layout: 'auth' })

// --- old signup feature (no phone, no strength check, no persistence) ---
// const onSignup = () => {
//   if (password.value !== confirmPassword.value) {
//     alert('Passwords do not match!')
//     return
//   }
//   console.log('Signup clicked:', { name: name.value, email: email.value, password: password.value })
// }
// --- end old signup feature ---

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const router = useRouter()

const MIN_PASSWORD_LENGTH = 7

const passwordStrength = computed(() => {
  const value = password.value
  let score = 0
  if (value.length >= MIN_PASSWORD_LENGTH) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++

  const levels = [
    { label: 'Too short', color: 'error' },
    { label: 'Weak', color: 'error' },
    { label: 'Fair', color: 'warning' },
    { label: 'Good', color: 'info' },
    { label: 'Strong', color: 'success' },
  ]
  return { score, ...levels[score] }
})

const onSignup = async () => {
  errorMessage.value = ''

  if (!name.value || !email.value || !phone.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }
  if (password.value.length < MIN_PASSWORD_LENGTH) {
    errorMessage.value = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match!'
    return
  }

  try {
    await $fetch('/auth/signup', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
      },
    })

    alert('Account created! Please log in.')
    router.push('/login')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Signup failed'
  }
}
</script>
