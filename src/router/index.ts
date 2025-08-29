// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      redirect: () => '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignupView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('@/views/VerifyEmailView.vue'),
      meta: { requiresAuth: false },
    },
    // {
    //   path: '/reset-password',
    //   name: 'reset-password',
    //   component: () => import('@/views/auth/ResetPasswordView.vue'),
    //   meta: { requiresAuth: false },
    // },

    // Protected routes (all wrapped by AppLayout)
    {
      path: '/',
      component: () => import('@/components/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'add-submission',
          name: 'add-submission',
          component: () => import('@/views/AddSubmissionView.vue'),
        },
        {
          path: 'read-submission',
          name: 'read-submission',
          component: () => import('@/views/ReadSubmission.vue'),
        },
        {
          path: 'admin/all-submissions/in-school',
          name: 'admin-all-submissions-in-school',
          component: () => import('@/views/AllSubmissions.vue'),
        },
      ],
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    // Wait until the store finished initializing
    if (!authStore.initialized) {
      await authStore.fetchUser();
    }

    if (!authStore.isAuthenticated) {
      return next('/login');
    }

    if (!authStore.user) {
      const success = await authStore.fetchUser();
      if (!success) {
        return next('/login');
      }
    }

    if (!authStore.isVerified) {
      // Redirect unverified users to a prompt page
      return next('/verify');
    }
  }

  // Redirect logged-in users away from auth pages
  if (
    !to.meta.requiresAuth &&
    authStore.isAuthenticated &&
    ['login', 'signup'].includes(to.name as string)
  ) {
    return next('/dashboard');
  }

  next();
});

export default router;
