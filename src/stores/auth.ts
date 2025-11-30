// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/utils/api';
import {
  type AuthSession,
  type SignupRequest,
  type UserProfile,
  LoginRequestSchema,
  SignupRequestSchema,
  AuthSessionSchema,
  UserProfileSchema,
} from '@/types/authapi';

const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS;
// assert not undefined and not empty
if (!ADMIN_EMAILS || ADMIN_EMAILS.trim() === '') {
  throw new Error('VITE_ADMIN_EMAILS is not set');
}
const adminEmails = ADMIN_EMAILS.split(',');

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null);
  const session = ref<AuthSession | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const initialized = ref<boolean>(false);

  const isAuthenticated = computed(() => !!session.value && !!user.value);
  const isVerified = computed(() => !!user.value?.is_email_verified);

  const isAdmin = computed(() => adminEmails.includes(user.value?.email || ''));

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
      // Validate input
      LoginRequestSchema.parse({ email, password });

      console.log('login');
      const { session: authSession } = await authApi.login(email, password);

      // Validate session response
      if (authSession) {
        AuthSessionSchema.parse(authSession);
      }

      console.log('setting session');
      setSession(authSession);
      // Get user profile info
      console.log('Get user profile info');
      const userProfile = await authApi.me();

      // Validate user profile response
      UserProfileSchema.parse(userProfile);

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
      // Validate input
      SignupRequestSchema.parse(data);

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

    // Validate session if present
    if (_session) {
      AuthSessionSchema.parse(_session);
    }

    setSession(_session);

    if (!session.value) {
      initialized.value = true;
      return false;
    }
    try {
      const userProfile = await authApi.me();

      // Validate user profile
      UserProfileSchema.parse(userProfile);

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

  // const verifyEmail = async (token: string): Promise<boolean> => {

  //   if (authApi.emailVerificationStrategy === 'provider-hosted') {
  //     // Some Providers handles the verification link
  //     // refeching user and getting isVerified.value gives us the data
  //     throw new Error('Email verification is handled by the provider. This method is not needed.');
  //   }

  //   fetchUser();

  //   if (isVerified.value) {
  //     console.log('Email is already verified.');
  //     return true;
  //   }

  //   loading.value = true;
  //   error.value = null;
  //   try {
  //     await authApi.verifyEmailByToken(token);
  //     return true;
  //   } catch (err: any) {
  //     error.value = err.response?.message || err.message || 'Email verification failed';
  //     return false;
  //   } finally {
  //     loading.value = false;
  //   }
  // };

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

  const updatePassword = async (
    newPassword: string,
    token?: string
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await authApi.updatePassword(newPassword, token);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const initializeAuth = async (): Promise<void> => {
    try {
      // Get initial session through API layer
      const initialSession = await authApi.getSession();

      // Validate initial session
      if (initialSession) {
        AuthSessionSchema.parse(initialSession);
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
    isAdmin,

    // Actions
    login,
    signup,
    fetchUser,
    logout,
    resetPasswordRequest,
    updatePassword,
    // verifyEmail,
    clearAuth,
    clearError,
    sendVerificationEmail,
  };
});
