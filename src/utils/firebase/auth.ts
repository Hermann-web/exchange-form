// src/utils/firebase/auth.ts
import type {
  AuthApiInterface,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  UserProfile,
  AuthSession,
  AuthUser,
} from '@/types/authapi';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

// Map Firebase user → AuthUser
const mapFirebaseUser = (firebaseUser: any): AuthUser => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || undefined,
  created_at: firebaseUser.metadata?.creationTime || undefined,
});

// Build session
const buildSession = async (firebaseUser: any): Promise<AuthSession> => {
  const token = await firebaseUser.getIdToken();
  const refreshToken = firebaseUser.refreshToken;
  return {
    access_token: token,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    user: mapFirebaseUser(firebaseUser),
    expires_at: undefined, // Firebase handles expiry internally
  };
};

// Current user
const getCurrentUser = async (): Promise<AuthUser> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw Error('user not found');
  await currentUser.reload(); // Refresh user data

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      unsubscribe();
      if (firebaseUser) {
        resolve(mapFirebaseUser(firebaseUser));
      } else {
        reject(new Error('No authenticated user'));
      }
    });
  });
};

export const authApi: AuthApiInterface = {
  emailVerificationStrategy: 'provider-hosted',
  passwordResetStrategy: 'provider-hosted',

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = mapFirebaseUser(userCredential.user);
    const session = await buildSession(userCredential.user);
    return { user, session };
  },

  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    const user = mapFirebaseUser(userCredential.user);
    const session = await buildSession(userCredential.user);
    return { user, session };
  },

  // sendVerificationEmail: async (_token: string): Promise<void> => {
  //   onAuthStateChanged(function(user) {
  //     user.sendEmailVerification();
  //   });
  // },
  sendVerificationEmail: async (): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    console.log('authenticated user: sending verification email');
    await sendEmailVerification(auth.currentUser);
  },

  verifyEmailByToken: async (): Promise<void> => {
    throw new Error('Already handled by firebase');
  },

  me: async (): Promise<UserProfile> => {
    const user = await getCurrentUser();
    const currentUser = auth.currentUser;
    if (!currentUser) throw Error('user not found');
    await currentUser.reload(); // Refresh user data
    const is_email_verified = currentUser.emailVerified;
    return {
      id: user.id,
      email: user.email || '',
      first_name: null,
      last_name: null,
      is_email_verified: is_email_verified,
      created_at: user.created_at,
    };
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  resetPasswordRequest: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  updatePassword: async (newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found.');
    }
    await updatePassword(user, newPassword);
  },

  getSession: async (): Promise<AuthSession | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          const session = await buildSession(firebaseUser);
          resolve(session);
        } else {
          resolve(null);
        }
      });
    });
  },
};
