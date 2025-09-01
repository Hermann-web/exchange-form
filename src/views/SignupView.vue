// src/views/SignupView.vue

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ref, reactive, computed } from 'vue';
import type { LogupForm } from '@/types';
import { testEmail } from '@/components/types';
import router from '@/router';
const isSubmitting = ref(false);
const authStore = useAuthStore();

const error = ref('');

const form = reactive<LogupForm>({
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  confirmPassword: '',
});

const emailError = computed(() => {
  if (!form.email) return '';
  return !testEmail(form.email) ? 'Please enter a valid email' : '';
});
const firstNameError = computed(() => {
  return !form.first_name ? 'First name is required' : '';
});

const lastNameError = computed(() => {
  return !form.last_name ? 'Last name is required' : '';
});
const passwordError = computed(() => {
  if (!form.password) return '';
  return form.password.length < 6 ? 'Password must be at least 6 characters' : '';
});

const confirmPasswordError = computed(() => {
  if (!form.confirmPassword) return '';
  return form.password !== form.confirmPassword ? 'Passwords do not match' : '';
});

const isFormValid = computed(() => {
  return (
    form.first_name &&
    form.last_name &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    !firstNameError.value &&
    !lastNameError.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  );
});

// const showPassword = ref(false);
// const showConfirmPassword = ref(false);
const success = ref(false);

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  try {
    if (form.password !== form.confirmPassword) {
      authStore.error = 'Passwords do not match';
      return;
    }

    const result = await authStore.signup({
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      password: form.password,
    });

    if (result) {
      success.value = true;
      router.push('/');
    }
  } catch (err) {
    // Error handled in composable
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p class="text-blue-100">Join the Exchange Program</p>
      </div>

      <!-- Signup Form -->
      <div class="glass rounded-2xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-blue-100 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="student@university.edu"
              :class="{ 'border-red-400': emailError }"
            />
            <p v-if="emailError" class="text-red-300 text-xs mt-1">
              {{ emailError }}
            </p>
          </div>
          <!-- Add these inside the <form> before the email field -->
          <div>
            <label for="first_name" class="block text-blue-100 text-sm font-medium mb-2">
              First Name
            </label>
            <input
              id="first_name"
              v-model="form.first_name"
              type="text"
              required
              class="input-field"
              placeholder="John"
            />
          </div>

          <div>
            <label for="last_name" class="block text-blue-100 text-sm font-medium mb-2">
              Last Name
            </label>
            <input
              id="last_name"
              v-model="form.last_name"
              type="text"
              required
              class="input-field"
              placeholder="Doe"
            />
          </div>

          <div>
            <label for="password" class="block text-blue-100 text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input-field"
              placeholder="Minimum 6 characters"
              :class="{ 'border-red-400': passwordError }"
            />
            <p v-if="passwordError" class="text-red-300 text-xs mt-1">
              {{ passwordError }}
            </p>
          </div>

          <div>
            <label
              for="confirmPassword"
              class="block text-blue-100 text-sm font-medium mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="input-field"
              placeholder="Confirm your password"
              :class="{ 'border-red-400': confirmPasswordError }"
            />
            <p v-if="confirmPasswordError" class="text-red-300 text-xs mt-1">
              {{ confirmPasswordError }}
            </p>
          </div>

          <div v-if="error" class="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
            <p class="text-red-300 text-sm">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            class="btn-primary w-full"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating account...
            </span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-blue-100 text-sm">
            Already have an account?
            <router-link
              to="/login"
              class="text-white font-semibold hover:underline ml-1"
            >
              Sign in
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
