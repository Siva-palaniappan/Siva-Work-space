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

          <!-- Error -->
          <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" variant="tonal">
            {{ errorMessage }}
          </v-alert>

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
import { useRouter } from 'vue-router'

definePageMeta({ layout: 'auth' })

// --- old login feature (external JWT backend) ---
// import axios from 'axios'
//
// const onLogin = async () => {
//   try {
//     const response = await axios.post('http://localhost:5000/api/auth/login', {
//       email: email.value,
//       password: password.value
//     })
//
//     const token = response.data.token
//     localStorage.setItem('jwt', token)
//
//     alert('Login successful!')
//     router.push('/gallery') // Redirect after login
//   } catch (err) {
//     alert('Invalid email or password')
//   }
// }
// --- end old login feature ---

const email = ref('')
const password = ref('')
const router = useRouter()
const errorMessage = ref('')

const onLogin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }

  try {
    const user = await $fetch('/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    localStorage.setItem('spendnest_userid', user.userid)
    localStorage.setItem('spendnest_username', user.name)

    router.push('/home')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Invalid email or password'
  }
}
</script>
