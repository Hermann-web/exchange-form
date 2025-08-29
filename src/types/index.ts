// src/types/index.ts
export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  first_name: string | null;
  last_name: string | null;
  is_email_verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

export interface LogupForm {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  confirmPassword?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface DossierForm {
  studentName: string;
  studentId: string;
  currentUniversity: string;
  targetUniversity: string;
  semester: string;
  program: string;
  motivation: string;
  documents: File[];
}

export interface AuthError {
  code: string;
  message: string;
}
