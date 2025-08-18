<template>
  <v-container class="fill-height d-flex justify-center align-center" fluid>
    <v-row class="w-100" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 pa-md-8 rounded-xl" elevation="10">
          <!-- Title -->
          <v-card-title class="text-h5 text-center mb-6">
            Login to Your Account
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

          <!-- Password -->
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            class="mb-4"
            clearable
          />

          <!-- Forgot Password -->
          <div class="text-right mb-4">
            <NuxtLink to="/forgot-password" class="text-blue">
              Forgot Password?
            </NuxtLink>
          </div>

          <!-- Login Button -->
          <v-btn block color="primary" class="mb-4" @click="onLogin">
            Login
          </v-btn>

          <!-- Divider -->
          <div class="d-flex align-center mb-4">
            <v-divider></v-divider>
            <span class="mx-2 text-caption text-grey">or</span>
            <v-divider></v-divider>
          </div>

          <!-- Signup link -->
          <div class="text-center">
            <span class="text-caption">Don’t have an account? </span>
            <NuxtLink to="/signup" class="text-blue font-weight-medium">
              Sign up
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
const password = ref('')

const onLogin = () => {
  console.log('Login clicked:', { email: email.value, password: password.value })
}
</script>
