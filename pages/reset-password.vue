<template>
  <v-container class="fill-height d-flex justify-center align-center" fluid>
    <v-row class="w-100" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 pa-md-8 rounded-xl" elevation="10">
          <!-- Title -->
          <v-card-title class="text-h6 text-md-h5 font-weight-bold text-center">
            Reset Password
          </v-card-title>

          <v-card-text>
            <!-- Info -->
            <div class="text-body-2 text-medium-emphasis mb-4">
              Please enter your new password and confirm it below.
            </div>

            <!-- New Password input -->
            <v-text-field
              v-model="newPassword"
              label="New Password"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock"
              :disabled="loading"
            />

            <!-- Confirm Password input -->
            <v-text-field
              v-model="confirmPassword"
              label="Confirm Password"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-check"
              :disabled="loading"
            />

            <!-- Success Message -->
            <v-alert
              v-if="message"
              type="success"
              variant="tonal"
              class="mb-3"
              border="start"
            >
              {{ message }}
            </v-alert>

            <!-- Error Message -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-3"
              border="start"
            >
              {{ error }}
            </v-alert>
          </v-card-text>

          <!-- Actions -->
          <v-card-actions class="d-flex justify-center">
            <v-btn
              color="primary"
              class="px-6"
              rounded="lg"
              :loading="loading"
              :disabled="!newPassword || !confirmPassword"
              @click="resetPassword"
            >
              Reset Password
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRoute } from 'vue-router'

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)

const route = useRoute()
token.value = (route.query.token as string) || ''

const { submitReset } = useAuth()

const resetPassword = async () => {
  message.value = ''
  error.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Please fill in both password fields.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    const res = await submitReset(token.value, newPassword.value)
    message.value = res?.message || 'Password has been reset successfully.'
  } catch (err: any) {
    error.value = err.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
