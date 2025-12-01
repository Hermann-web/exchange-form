<!-- src/views/VerifyEmail.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authApi } from '@/utils/api';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const verificationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const token = ref('');
const email = ref('');

const isProviderHosted = computed(
  () => authApi.emailVerificationStrategy === 'provider-hosted'
);

// Pre-fill token from URL query params on mount (only for app-hosted)
onMounted(() => {
  if (!isProviderHosted.value) {
    const queryToken = route.query.token as string;
    if (queryToken) {
      token.value = queryToken;
    }
  }
  email.value = authStore.user?.email || '';
});

const sendVerificationEmailNoSession = async () => {
  try {
    authStore.clearError();
    const res = await authStore.sendVerificationEmailNoSession(email.value);
    if (res) {
      alert('Email de vérification envoyé ! Veuillez vérifier votre boîte de réception.');
    }
  } catch (err: any) {
    authStore.error = err.message || "Échec de l'envoi de l'email de vérification.";
  }
};

const verifyEmailWithToken = async () => {
  // Provider-hosted doesn't use token verification
  if (isProviderHosted.value) {
    authStore.error =
      "La vérification est déjà gérée par le service d'authentification. Veuillez vérifier votre boîte mail.";
    return;
  }

  if (!token.value.trim()) {
    authStore.error = 'Veuillez entrer un token de vérification.';
    return;
  }

  authStore.clearError();
  verificationStatus.value = 'loading';

  const success = await authStore.verifyEmail(token.value.trim());

  if (success) {
    verificationStatus.value = 'success';
    setTimeout(() => {
      authStore.clearError();
      router.push('/login');
    }, 3000);
  } else {
    verificationStatus.value = 'error';
  }
};

const checkProviderVerification = async () => {
  authStore.clearError();
  verificationStatus.value = 'loading';

  // Refetch user to check if email is now verified
  const success = await authStore.fetchUser();

  if (success && authStore.isVerified) {
    verificationStatus.value = 'success';
    setTimeout(() => {
      authStore.clearError();
      router.push('/dashboard');
    }, 2000);
  } else {
    verificationStatus.value = 'idle';
    authStore.error =
      'Email non vérifié. Veuillez cliquer sur le lien dans votre boîte mail.';
  }
};

const redirectToDashboard = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- Already Verified - Redirect Option -->
    <div
      v-if="authStore.isAuthenticated && authStore.isVerified"
      class="glass rounded-2xl p-6 mb-8 text-center"
    >
      <CheckCircleIcon class="w-16 h-16 text-green-500 mx-auto mb-4" />
      <p class="text-green-500 text-lg font-medium mb-4">
        Votre email est déjà vérifié !
      </p>
      <button @click="redirectToDashboard" class="btn-primary inline-flex items-center">
        Aller au tableau de bord
      </button>
    </div>

    <!-- Provider-Hosted Verification Info -->
    <div
      v-if="!authStore.isVerified && isProviderHosted"
      class="glass rounded-2xl p-6 mb-8"
    >
      <div class="flex items-start space-x-3 mb-4">
        <InformationCircleIcon class="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h2 class="text-xl font-bold text-white mb-2">
            Vérification par le fournisseur
          </h2>
          <p class="text-gray-300 mb-4">
            La vérification de votre email est déjà gérée par le service
            d'authentification. Veuillez cliquer sur le lien de vérification envoyé dans
            votre boîte mail.
          </p>
        </div>
      </div>

      <button
        @click="checkProviderVerification"
        :disabled="authStore.loading"
        class="btn-primary w-full inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircleIcon class="w-5 h-5 mr-2" />
        {{ authStore.loading ? 'Vérification en cours...' : 'Vérifier le statut' }}
      </button>

      <!-- Status Messages -->
      <div v-if="verificationStatus === 'success'" class="mt-4 text-center">
        <p class="text-green-500 text-lg font-medium">
          Email vérifié avec succès ! Redirection vers le tableau de bord...
        </p>
      </div>
    </div>

    <!-- App-Hosted Token Verification Section -->
    <div
      v-if="!authStore.isVerified && !isProviderHosted"
      class="glass rounded-2xl p-6 mb-8"
    >
      <h2 class="text-2xl font-bold text-white mb-4 text-center">
        Vérification de l'email
      </h2>

      <div class="space-y-4">
        <div>
          <label for="token" class="block text-sm font-medium text-gray-300 mb-2">
            Token de vérification
          </label>
          <input
            id="token"
            v-model="token"
            type="text"
            placeholder="Entrez votre token de vérification"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          @click="verifyEmailWithToken"
          :disabled="authStore.loading || verificationStatus === 'loading'"
          class="btn-primary w-full inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircleIcon class="w-5 h-5 mr-2" />
          {{ authStore.loading ? 'Vérification en cours...' : "Vérifier l'email" }}
        </button>
      </div>

      <!-- Status Messages -->
      <div v-if="verificationStatus === 'success'" class="mt-4 text-center">
        <p class="text-green-500 text-lg font-medium">
          Email vérifié avec succès ! Redirection vers la connexion...
        </p>
      </div>
    </div>

    <!-- Error Display -->
    <div
      v-if="authStore.error"
      class="bg-red-500/20 border border-red-400/30 rounded-lg p-3"
    >
      <p class="text-red-300 text-sm">{{ authStore.error }}</p>
    </div>

    <!-- Resend Email Section (only if not verified) -->
    <div v-if="!authStore.isVerified" class="glass rounded-2xl p-6 mb-8 text-center">
      <p class="text-yellow-400 text-lg font-medium mb-4">
        Vous n'avez pas reçu l'email de vérification ?
      </p>

      <!-- Show email input if not authenticated -->
      <div v-if="!authStore.isAuthenticated" class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-300 mb-2 text-left">
          Adresse email
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Entrez votre adresse email"
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Show current email if authenticated -->
      <p v-else class="text-gray-400 text-sm mb-4">Email actuel : {{ email }}</p>

      <button
        @click="sendVerificationEmailNoSession"
        :disabled="authStore.loading || (!authStore.isAuthenticated && !email.trim())"
        class="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <DocumentTextIcon class="w-5 h-5 mr-2" />
        Renvoyer l'email de vérification
      </button>
    </div>
  </div>
</template>
