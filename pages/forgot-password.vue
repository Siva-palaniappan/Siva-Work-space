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
          <v-btn block color="primary" class="mb-4" @click="onReset">
            Send Reset Link
          </v-btn>

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

const email = ref('')

const onReset = () => {
  console.log('Reset link sent to:', email.value)
}
</script>
