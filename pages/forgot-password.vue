<template>
  <v-container class="fill-height d-flex justify-center align-center" fluid>
    <v-row class="w-100" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 pa-md-8 rounded-xl" elevation="10">
          <!-- Title -->
          <v-card-title class="text-h5 text-center mb-6">
            Reset Your Password
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

          <!-- Reset Button -->
          <v-btn
            block
            color="primary"
            class="mb-4"
            :loading="loading"
            @click="sendResetLink"
          >
            Send Reset Link
          </v-btn>

          <!-- Success message -->
          <div v-if="message" class="text-green text-center mb-2">
            {{ message }}
          </div>

          <!-- Error message -->
          <div v-if="error" class="text-red text-center mb-2">
            {{ error }}
          </div>

          <!-- Back to login -->
          <div class="text-center">
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
import { useAuth } from '~/composables/useAuth'

const email = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)

const { submitEmail } = useAuth()

const sendResetLink = async () => {
  message.value = ''
  error.value = ''
  loading.value = true

  try {
    const res = await submitEmail(email.value)
    message.value = res?.message || 'If the email exists, a reset link has been sent.'
  } catch (err: any) {
    error.value = err.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
