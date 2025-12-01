// src/types/authapi.ts

import { z } from 'zod';

// Auth API Types
export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export interface LoginRequest extends z.infer<typeof LoginRequestSchema> {}

export const AuthUserSchema = z
  .object({
    id: z.string(),
    email: z.string().optional(),
    created_at: z.string().optional(),
  })
  .loose();

export interface AuthUser extends z.infer<typeof AuthUserSchema> {}

export const AuthSessionSchema = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number().optional(),
    token_type: z.string(),
    user: AuthUserSchema,
  })
  .loose();

export interface AuthSession extends z.infer<typeof AuthSessionSchema> {}

export const LoginResponseSchema = z.object({
  user: AuthUserSchema.nullable(),
  session: AuthSessionSchema.nullable(),
});

export interface LoginResponse extends z.infer<typeof LoginResponseSchema> {}

export const SignupRequestSchema = z.object({
  email: z.email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(6), // Assuming a minimum length for password
});

export interface SignupRequest extends z.infer<typeof SignupRequestSchema> {}

export const SignupResponseSchema = z.object({
  user: AuthUserSchema.nullable(),
  session: AuthSessionSchema.nullable(),
});

export interface SignupResponse extends z.infer<typeof SignupResponseSchema> {}

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  is_email_verified: z.boolean(),
  created_at: z.string().optional(),
});

export interface UserProfile extends z.infer<typeof UserProfileSchema> {}

export type PasswordResetStrategy = 'provider-hosted' | 'app-hosted';

export type EmailVerificationStrategy = 'provider-hosted' | 'app-hosted';

// API Interface Definitions
export interface AuthApiInterface {
  login(email: string, password: string): Promise<LoginResponse>;

  // email verification handling
  emailVerificationStrategy: EmailVerificationStrategy;
  // email verification request (user is authenticated or not)
  // a mail will get sent along with a token (in url or not)
  sendVerificationEmail(): Promise<void>;
  sendVerificationEmailNoSession(email: string): Promise<void>;
  // the user send the token on the interface here (copy or url click)
  // user not authenticated (if token define the user)
  // some backend handled redirect user to their own url so this would not be needed
  verifyEmailFromOTP(token: string): Promise<boolean>;

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
