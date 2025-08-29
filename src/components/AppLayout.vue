<!-- src/components/AppLayout.vue -->
<script setup lang="ts">
// import { ref } from "vue";
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
const router = useRouter();
// const sidebarOpen = ref(false);
// import { HomeIcon } from "@heroicons/vue/24/outline";

// const navigation = [
//   { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
//   { name: "Dossier", href: "/dossier", icon: HomeIcon },
// ];

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-800 to-blue-950">
    <!-- Navigation -->
    <nav class="glass backdrop-blur-lg border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/dashboard" class="flex items-center space-x-3">
              <div
                class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"
              >
                <span class="text-white font-bold text-lg">S8</span>
              </div>
              <span class="text-white font-semibold text-xl">Exchange Portal</span>
            </router-link>
          </div>

          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <router-link
              to="/dashboard"
              class="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'bg-white/20': $route.name === 'Dashboard' }"
            >
              Dashboard
            </router-link>
            <router-link
              to="/add-submission"
              class="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'bg-white/20': $route.name === 'Dossier' }"
            >
              Submit Dossier
            </router-link>
            <div class="flex items-center space-x-3">
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
          <p>&copy; 2025 S8 Exchange Portal - Secure Document Submission</p>
        </div>
      </div>
    </footer>
  </div>
</template>
