// src/utils/fastapi/auth.ts
import axios from 'axios';
import type {
  AuthApiInterface,
  AuthSession,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  UserProfile,
} from '@/types/authapi';
import { ApiError } from '@/types/exceptions';

const API_BASE_URL = import.meta.env.VITE_CUSTOM_DB_BASE_URL || 'http://localhost:8000';
const STORAGE_KEY = 'fastapi_auth_session';

// Helper to get token
const getAccessToken = (): string | null => {
  const sessionStr = localStorage.getItem(STORAGE_KEY);
  if (!sessionStr) return null;
  try {
    const session: AuthSession = JSON.parse(sessionStr);
    return session.access_token;
  } catch {
    return null;
  }
};

// Helper for auth headers
const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authApi: AuthApiInterface = {
  emailVerificationStrategy: 'provider-hosted',
  passwordResetStrategy: 'provider-hosted',

  async login(email, password): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const data: LoginResponse = response.data;

      if (data.session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.session));
      }

      return data;
    } catch (error: any) {
      if (error.status === 401 || error.status === 400) {
        console.log(`=error.response`, JSON.stringify(error.response));
        const rsp_msg =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          '';
        const msg: string = rsp_msg.includes('Please verify your email')
          ? 'Please check your mailbox to verify your email'
          : rsp_msg.includes('Invalid credentials')
            ? 'Invalid credentials'
            : rsp_msg;
        throw new ApiError(msg, error.response?.status);
      }
      throw new ApiError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Login failed',
        error.response?.status
      );
    }
  },

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    try {
      // Map SignupRequest to SignupDto (if needed, but they look identical in specs)
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      const data: SignupResponse = response.data;

      if (data.session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.session));
      }

      return data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Signup failed',
        error.response?.status
      );
    }
  },

  async me(): Promise<UserProfile> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to fetch user profile',
        error.response?.status
      );
    }
  },

  async logout(): Promise<void> {
    // Local logout only as per specs (no logout endpoint mentioned, though interface has it)
    localStorage.removeItem(STORAGE_KEY);
    // If backend had a logout endpoint, we would call it here
  },

  async sendVerificationEmail(): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/resend-verification`,
        {},
        { headers: getAuthHeaders() }
      );
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to send verification email',
        error.response?.status
      );
    }
  },

  async sendVerificationEmailNoSession(email: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/resend-verification`,
        { email: email },
        { headers: getAuthHeaders() }
      );
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to send verification email',
        error.response?.status
      );
    }
  },

  async verifyEmailFromOTP(token: string): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/auth/verify?token=${token}`);
      return true;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Email verification failed',
        error.response?.status
      );
    }
  },

  async resetPasswordRequest(email: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/password/reset-request`, { email });
    } catch (error: any) {
      // Always succeed for security reasons if 200 is returned
      if (error.response?.status !== 200) {
        throw new ApiError(
          error.response?.data?.message ||
            error.response?.data?.detail ||
            error.message ||
            'Password reset request failed',
          error.response?.status
        );
      }
    }
  },

  async updatePasswordWithoutSession(
    newPassword: string,
    token: string,
    _username?: string
  ): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/password/reset`, {
        token,
        newPassword,
      });
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Password reset failed',
        error.response?.status
      );
    }
  },

  async updatePassword(_newPassword: string, _token?: string): Promise<void> {
    // Not supported by current backend specs
    // Could potentially use reset flow if token is provided, but interface implies authenticated session
    throw new ApiError(
      'Update password while logged in is not supported by the backend yet.'
    );
  },

  async getSession(): Promise<AuthSession | null> {
    const sessionStr = localStorage.getItem(STORAGE_KEY);
    if (!sessionStr) return null;
    try {
      const session: AuthSession = JSON.parse(sessionStr);
      // Optional: Check expiry if needed
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },
};
