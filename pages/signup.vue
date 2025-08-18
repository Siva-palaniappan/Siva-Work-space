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

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const onSignup = () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match!')
    return
  }
  console.log('Signup clicked:', { name: name.value, email: email.value, password: password.value })
}
</script>
