<!-- src/components/AppLayout.vue -->
<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-800 to-blue-950 flex flex-col"
  >
    <!-- Navigation -->
    <nav class="glass backdrop-blur-lg border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo + Brand -->
          <div class="flex items-center">
            <router-link to="/dashboard" class="flex items-center space-x-3">
              <img
                src="/logo-48x48.png"
                alt="Student Exchange Logo"
                class="h-8 w-8 rounded-lg"
              />
              <span class="text-white font-semibold text-xl hidden sm:inline">
                Student Academic Exchange Application
              </span>
              <span class="text-white font-semibold text-xl sm:hidden">
                Academic Exchange
              </span>
            </router-link>
          </div>

          <!-- Authenticated Navigation -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <router-link
              to="/dashboard"
              class="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hidden sm:block"
              :class="{ 'bg-white/20': $route.name === 'dashboard' }"
            >
              Dashboard
            </router-link>
            <router-link
              to="/add-submission"
              class="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'bg-white/20': $route.name === 'add-submission' }"
            >
              Submit Application
            </router-link>
            <div class="items-center space-x-3 hidden sm:flex">
              <span class="text-blue-100 text-sm">{{ authStore.user?.email }}</span>
              <button
                @click="handleLogout"
                class="text-red-200 hover:text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="glass backdrop-blur-lg border-t border-white/20 mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div class="text-center text-blue-100 text-sm">
          <p>
            &copy; 2025 Student Academic Exchange Application - Secure Document Submission
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
