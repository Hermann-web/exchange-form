// src/mockup/auth.ts

import type {
  AuthApiInterface,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  UserProfile,
  AuthSession,
} from '@/types/authapi';

const MOCK_USER: UserProfile = {
  id: 'mock-user-id',
  email: `mock.mock@${import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN}`,
  first_name: 'Mock',
  last_name: 'User',
  is_email_verified: true,
  created_at: new Date().toISOString(),
};

const MOCK_SESSION: AuthSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  token_type: 'bearer',
  user: {
    id: MOCK_USER.id,
    email: MOCK_USER.email,
  },
  expires_at: Date.now() + 3600 * 1000,
};

export const authApi: AuthApiInterface = {
  emailVerificationStrategy: 'app-hosted',
  passwordResetStrategy: 'app-hosted',

  async login(email: string, _password: string): Promise<LoginResponse> {
    console.log('[MockAuth] Login', email);
    return {
      user: { id: MOCK_USER.id, email },
      session: MOCK_SESSION,
    };
  },

  async sendVerificationEmail(): Promise<void> {
    console.log('[MockAuth] Sending verification email');
  },

  async verifyEmailFromOTP(token: string): Promise<boolean> {
    console.log('[MockAuth] Verifying email with token', token);
    return true;
  },

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    console.log('[MockAuth] Signup', userData);
    return {
      user: { id: MOCK_USER.id, email: userData.email },
      session: MOCK_SESSION,
    };
  },

  async me(): Promise<UserProfile> {
    console.log('[MockAuth] Get user profile');
    return MOCK_USER;
  },

  async logout(): Promise<void> {
    console.log('[MockAuth] Logout');
  },

  async resetPasswordRequest(email: string): Promise<void> {
    console.log('[MockAuth] Reset password request for', email);
  },

  async updatePasswordWithoutSession(
    newPassword: string,
    token: string,
    username?: string
  ): Promise<void> {
    console.log('[MockAuth] Update password (no session)', {
      newPassword,
      token,
      username,
    });
  },

  async updatePassword(newPassword: string, token?: string): Promise<void> {
    console.log('[MockAuth] Update password', { newPassword, token });
  },

  async getSession(): Promise<AuthSession | null> {
    console.log('[MockAuth] Get session');
    return MOCK_SESSION;
  },
};
