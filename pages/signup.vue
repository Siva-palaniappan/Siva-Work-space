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
        class="mb-4"
        clearable
      />

      <!-- Confirm Password -->
      <v-text-field
        v-model="confirmPassword"
        label="Confirm Password"
        type="password"
        variant="outlined"
        class="mb-4"
        clearable
      />

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
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')

const { register } = useAuth()

const onSignup = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match!')
    return
  }

  const { data, error } = await register(email.value, password.value, phone.value)

  if (error.value) {
    alert('Registration failed: ' + error.value.statusMessage)
  } else {
    alert('Registered successfully!')
    console.log('Backend response:', data.value)
  }
}
</script>
