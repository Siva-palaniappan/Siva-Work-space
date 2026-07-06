<template>
  <v-container class="fill-height d-flex justify-center align-center" fluid>
    <v-row class="w-100" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 pa-md-8 rounded-xl" elevation="10">
          <!-- Title -->
          <v-card-title class="text-h5 text-center mb-6">
            Reset Your Password
          </v-card-title>

          <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" variant="tonal">
            {{ errorMessage }}
          </v-alert>

          <!-- Step 1: email -->
          <template v-if="step === 'email'">
            <v-text-field
              v-model="email"
              label="Email Address"
              type="email"
              variant="outlined"
              class="mb-4"
              clearable
              @keyup.enter="onContinue"
            />
            <v-btn block color="primary" class="mb-4" @click="onContinue">
              Continue
            </v-btn>
          </template>

          <!-- Step 2: new password -->
          <template v-else-if="step === 'reset'">
            <p class="text-caption text-grey mb-4">Resetting password for <b>{{ email }}</b></p>

            <v-text-field
              v-model="password"
              label="New Password"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              class="mb-4"
              clearable
              hint="At least 7 characters"
            />

            <v-text-field
              v-model="confirmPassword"
              label="Confirm New Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              variant="outlined"
              class="mb-4"
              clearable
              @keyup.enter="onReset"
            />

            <v-btn block color="primary" class="mb-2" @click="onReset">
              Reset Password
            </v-btn>
            <v-btn block variant="text" @click="step = 'email'">
              Back
            </v-btn>
          </template>

          <!-- Step 3: done -->
          <template v-else>
            <v-alert type="success" density="compact" class="mb-4" variant="tonal">
              Password updated. You can log in now.
            </v-alert>
            <v-btn block color="primary" class="mb-4" to="/login">
              Go to Login
            </v-btn>
          </template>

          <!-- Back to login -->
          <div v-if="step !== 'done'" class="text-center">
            <NuxtLink to="/login" class="text-blue font-weight-medium">
              Back to Login
            </NuxtLink>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'auth' })

const MIN_PASSWORD_LENGTH = 7

const step = ref<'email' | 'reset' | 'done'>('email')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')

const onContinue = () => {
  errorMessage.value = ''
  if (!email.value) {
    errorMessage.value = 'Please enter your email.'
    return
  }
  step.value = 'reset'
}

const onReset = async () => {
  errorMessage.value = ''

  if (password.value.length < MIN_PASSWORD_LENGTH) {
    errorMessage.value = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  try {
    await $fetch('/auth/reset-password', {
      method: 'POST',
      body: { email: email.value, password: password.value, confirmPassword: confirmPassword.value },
    })
    step.value = 'done'
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Failed to reset password'
  }
}
</script>
