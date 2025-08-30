// src/types/authapi.ts

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser | null;
  session: AuthSession | null;
}

export interface SignupRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface SignupResponse {
  user: AuthUser | null;
  session: AuthSession | null;
}

export interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
  [key: string]: any;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_email_verified: boolean;
  created_at?: string;
}

export type PasswordResetStrategy = 'provider-hosted' | 'app-hosted';

export type EmailVerificationStrategy = 'provider-hosted' | 'app-hosted';

// API Interface Definitions
export interface AuthApiInterface {
  login(email: string, password: string): Promise<LoginResponse>;

  emailVerificationStrategy: EmailVerificationStrategy;
  sendVerificationEmail(): Promise<void>;
  verifyEmailByToken(token: string): Promise<void>;

  signup(userData: SignupRequest): Promise<SignupResponse>;
  me(): Promise<UserProfile>;
  logout(): Promise<void>;

  passwordResetStrategy: PasswordResetStrategy;
  resetPasswordRequest(email: string): Promise<void>;
  updatePassword(newPassword: string, token?: string): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  //   onAuthStateChange(callback: AuthStateChangeCallback): { data: { subscription: any } };
}
