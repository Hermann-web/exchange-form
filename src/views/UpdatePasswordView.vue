<!-- src/views/UpdatePasswordView.vue -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isSubmitting = ref(false);
const success = ref(false);
const isResetFlow = ref(false);
const resetToken = ref<string | null>(null);

// Check if this is a password reset flow (has token)
onMounted(() => {
  const token = route.query.token as string;
  if (token) {
    isResetFlow.value = true;
    resetToken.value = token;
  }
});

const passwordError = computed(() => {
  if (!form.newPassword) return '';
  if (form.newPassword.length < 8) return 'Password must be at least 8 characters';
  return '';
});

const confirmPasswordError = computed(() => {
  if (!form.confirmPassword) return '';
  if (form.newPassword !== form.confirmPassword) return 'Passwords do not match';
  return '';
});

const isFormValid = computed(() => {
  const baseValid =
    form.newPassword &&
    form.confirmPassword &&
    !passwordError.value &&
    !confirmPasswordError.value;

  // If not reset flow, current password is required
  if (!isResetFlow.value) {
    return baseValid && form.currentPassword;
  }

  return baseValid;
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  authStore.clearError();

  try {
    const result = await authStore.updatePassword(
      form.newPassword,
      isResetFlow.value ? resetToken.value || undefined : undefined
    );

    if (result) {
      success.value = true;

      // Clear form
      form.currentPassword = '';
      form.newPassword = '';
      form.confirmPassword = '';

      // Redirect after success
      setTimeout(() => {
        if (isResetFlow.value) {
          router.push('/login');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    }
  } catch (err) {
    // Error handled in store
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">
        {{ isResetFlow ? 'Reset Your Password' : 'Update Password' }}
      </h1>
      <p class="text-blue-100">
        {{
          isResetFlow
            ? 'Enter your new password below'
            : 'Change your current password to a new one'
        }}
      </p>
    </div>

    <!-- Success State -->
    <div v-if="success" class="glass rounded-2xl p-8 text-center mb-8">
      <CheckCircleIcon class="h-16 w-16 text-green-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-white mb-2">Password Updated Successfully</h2>
      <p class="text-blue-100 mb-4">
        Your password has been updated.
        {{
          isResetFlow
            ? 'You will be redirected to login shortly.'
            : 'You will be redirected to dashboard shortly.'
        }}
      </p>
      <div
        class="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mx-auto"
      ></div>
    </div>

    <!-- Form -->
    <div v-else class="glass rounded-2xl p-8">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Current Password (only for authenticated users, not reset flow) -->
        <div v-if="!isResetFlow">
          <label
            for="currentPassword"
            class="block text-blue-100 text-sm font-medium mb-2"
          >
            Current Password
          </label>
          <div class="relative">
            <input
              id="currentPassword"
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              required
              class="input-field pr-12"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
            >
              <EyeIcon v-if="showCurrentPassword" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- New Password -->
        <div>
          <label for="newPassword" class="block text-blue-100 text-sm font-medium mb-2">
            New Password
          </label>
          <div class="relative">
            <input
              id="newPassword"
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              class="input-field pr-12"
              placeholder="Enter your new password"
              :class="{ 'border-red-400': passwordError }"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
            >
              <EyeIcon v-if="showNewPassword" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p v-if="passwordError" class="text-red-300 text-xs mt-1">
            {{ passwordError }}
          </p>
          <p class="text-blue-200 text-xs mt-1">
            Password must be at least 8 characters long
          </p>
        </div>

        <!-- Confirm New Password -->
        <div>
          <label
            for="confirmPassword"
            class="block text-blue-100 text-sm font-medium mb-2"
          >
            Confirm New Password
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="input-field pr-12"
              placeholder="Confirm your new password"
              :class="{ 'border-red-400': confirmPasswordError }"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
            >
              <EyeIcon v-if="showConfirmPassword" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p v-if="confirmPasswordError" class="text-red-300 text-xs mt-1">
            {{ confirmPasswordError }}
          </p>
        </div>

        <!-- Error Display -->
        <div
          v-if="authStore.error"
          class="bg-red-500/20 border border-red-400/30 rounded-lg p-3"
        >
          <p class="text-red-300 text-sm">{{ authStore.error }}</p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          class="btn-primary w-full sm:w-auto inline-flex items-center justify-center"
        >
          <KeyIcon class="h-5 w-5 mr-2" />
          <span v-if="isSubmitting" class="flex items-center">
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
            Updating...
          </span>
          <span v-else>Update Password</span>
        </button>
      </form>

      <!-- Reset Flow Info -->
      <div
        v-if="isResetFlow"
        class="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg"
      >
        <p class="text-blue-100 text-sm">
          <strong>Note:</strong> After updating your password, you'll be redirected to the
          login page to sign in with your new credentials.
        </p>
      </div>
    </div>
  </div>
</template>
