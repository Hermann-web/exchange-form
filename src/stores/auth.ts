// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/utils/api';
import type { User } from '@/types';
import type { AuthSession, SignupRequest, UserProfile } from '@/types/authapi';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<AuthSession | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const initialized = ref<boolean>(false);

  const isAuthenticated = computed(() => !!session.value && !!user.value);
  const isVerified = computed(() => !!user.value?.is_email_verified);

  const setSession = (newSession: AuthSession | null): void => {
    session.value = newSession;
  };

  const clearAuth = (): void => {
    user.value = null;
    session.value = null;
  };

  const setUserFromProfile = (userProfile: UserProfile): void => {
    user.value = {
      id: userProfile.id,
      email: userProfile.email,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      is_email_verified: userProfile.is_email_verified,
    };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      console.log('login');
      const { session: authSession } = await authApi.login(email, password);
      console.log('setting session');
      setSession(authSession);
      // Get user profile info
      console.log('Get user profile info');
      const userProfile = await authApi.me();
      console.log('setting user from profile');
      setUserFromProfile(userProfile);
      console.log('done');
      return true;
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    console.log('sending verification email');
    await authApi.sendVerificationEmail();
  };

  const signup = async (data: SignupRequest): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await authApi.signup(data);
      await sendVerificationEmail();
      return true;
    } catch (err: any) {
      error.value = err.message || 'Signup failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchUser = async (): Promise<boolean> => {
    const _session = await authApi.getSession();
    setSession(_session);

    if (!session.value) {
      initialized.value = true;
      return false;
    }
    try {
      const userProfile = await authApi.me();
      setUserFromProfile(userProfile);
      initialized.value = true;
      return true;
    } catch (err: any) {
      clearAuth();
      initialized.value = true;
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    loading.value = true;
    try {
      await authApi.logout();
      clearAuth();
    } catch (err: any) {
      // Even if logout fails, clear local auth state
      clearAuth();
    } finally {
      loading.value = false;
    }
  };

  const resetPasswordRequest = async (email: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await authApi.resetPasswordRequest(email);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to send reset password email';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (
    newPassword: string,
    confirmPassword?: string,
    token?: string
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await authApi.resetPassword(newPassword, confirmPassword, token);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await authApi.verifyEmailByToken(token);
      return true;
    } catch (err: any) {
      error.value = err.response?.message || err.message || 'Email verification failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const initializeAuth = async (): Promise<void> => {
    try {
      // Get initial session through API layer
      const initialSession = await authApi.getSession();
      if (initialSession) {
        setSession(initialSession);
        await fetchUser();
      } else {
        initialized.value = true;
      }
    } catch (err: any) {
      // Error getting session
      clearAuth();
      initialized.value = true;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  // Initialize auth state
  initializeAuth();

  return {
    // State
    user,
    session,
    loading,
    error,
    initialized,
    isAuthenticated,
    isVerified,

    // Actions
    login,
    signup,
    fetchUser,
    logout,
    resetPasswordRequest,
    resetPassword,
    verifyEmail,
    clearAuth,
    clearError,
    sendVerificationEmail,
  };
});
