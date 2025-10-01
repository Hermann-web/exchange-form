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

  // email verification handling
  emailVerificationStrategy: EmailVerificationStrategy;
  // email verification request (user is authenticated)
  // a mail will get sent along with a token (in url or not)
  sendVerificationEmail(): Promise<void>;
  // the user send the token on the interface here (copy or url click)
  // user not authenticated (if token define the user)
  // some backend handled redirect user to their own url so this would not be needed
  verifyEmailWithoutSession(token: string): Promise<void>;

  signup(userData: SignupRequest): Promise<SignupResponse>;
  me(): Promise<UserProfile>;
  logout(): Promise<void>;

  // password update handling
  passwordResetStrategy: PasswordResetStrategy;
  // password update request (user is not authenticated)
  // a mail will get sent along with a token (in url or not)
  resetPasswordRequest(email: string): Promise<void>;

  // if PasswordResetStrategy = "provider-hosted"
  // i assume the backend handled redirect user to their own url
  // so handling the update would not be needed
  // if PasswordResetStrategy==app-hosted
  // the user send the token on the interface here (copy or url click)
  // user not authenticated (username + tokenFromMail + newpassw) or (tokenFromMail + newpassw)
  updatePasswordWithoutSession(
    newPassword: string,
    token: string,
    username?: string
  ): Promise<void>;

  // user authenticated (session + oldpassw (exra safety) + newpassw)
  updatePassword(newPassword: string, token?: string): Promise<void>;

  getSession(): Promise<AuthSession | null>;
}
