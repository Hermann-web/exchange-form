// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
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
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/VerifyEmailView.vue'),
      meta: { requiresAuth: false },
    },

    // Protected routes (all wrapped by AppLayout)
    {
      path: '/',
      component: () => import('@/components/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'update-password',
          name: 'update-password',
          component: () => import('@/views/UpdatePasswordView.vue'),
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
          meta: { requiresAuth: true, requiresAdmin: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false }, // or true, depending on your app
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Ensure store is initialized for everyone
  // as public routes (eg. login/logup) rely on authStore
  if (!authStore.initialized) {
    await authStore.fetchUser();
  }

  if (authStore.isVerified && to.name === 'verify-email') return next('/dashboard');

  // Then handle protected routes
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) return next('/login');
    if (!authStore.isVerified && to.name !== 'verify-email') return next('/verify-email');
  }

  if (to.meta.requiresAdmin) {
    if (!authStore.isAdmin) return next('/dashboard');
  }

  // Prevent logged-in users from going back to auth pages
  else if (authStore.isAuthenticated && ['login', 'signup'].includes(to.name as string)) {
    return next('/dashboard');
  }

  next();
});

export default router;
