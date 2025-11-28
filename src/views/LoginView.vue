<!-- src/views/LoginView.vue -->
<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import { testEmail } from '@/components/types';

const router = useRouter();
const authStore = useAuthStore();

export interface LoginForm {
  email: string;
  password: string;
}

const form = reactive<LoginForm>({
  email: '',
  password: '',
});
const showPassword = ref(false);
const isSubmitting = ref(false);

const emailError = computed(() => {
  if (!form.email) return '';
  return !testEmail(form.email) ? 'Veuillez entrer un email valide' : '';
});

const isFormValid = computed(() => {
  return form.email && form.password && !emailError.value;
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;
  isSubmitting.value = true;
  authStore.clearError(); // Effacer les erreurs précédentes
  try {
    const success = await authStore.login(form.email, form.password);
    if (success) {
      router.push('/dashboard');
    }
  } catch (err) {
    // Erreur gérée dans le store
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
        <h1 class="text-3xl font-bold text-white mb-2">Bienvenue</h1>
        <p class="text-blue-100">
          Connectez-vous pour accéder à votre portail d'échange académique
        </p>
      </div>

      <!-- Login Form -->
      <div class="glass rounded-2xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-blue-100 text-sm font-medium mb-2">
              Adresse Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="etudiant@universite.ma"
              :class="{ 'border-red-400': emailError }"
            />
            <p v-if="emailError" class="text-red-300 text-xs mt-1">
              {{ emailError }}
            </p>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="password" class="block text-blue-100 text-sm font-medium">
                Mot de Passe
              </label>
              <router-link
                to="/forgot-password"
                class="text-blue-200 hover:text-white text-xs transition-colors"
              >
                Mot de passe oublié ?
              </router-link>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field pr-12"
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
              >
                <EyeIcon v-if="showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            v-if="authStore.error"
            class="bg-red-500/20 border border-red-400/30 rounded-lg p-3"
          >
            <p class="text-red-300 text-sm">{{ authStore.error }}</p>
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
              Connexion en cours...
            </span>
            <span v-else>Se Connecter</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-blue-100 text-sm">
            Vous n'avez pas de compte ?
            <router-link
              to="/signup"
              class="text-white font-semibold hover:underline ml-1"
            >
              Créez-en un
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
