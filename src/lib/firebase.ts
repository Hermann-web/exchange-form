// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY!,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN!,
  projectId: import.meta.env.FIREBASE_PROJECT_ID!,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: import.meta.env.FIREBASE_APP_ID!,
};
// Initialize Firebase services
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
const storage = getStorage();

// Helper function to upload a single file
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const fileRef = ref(storage, path);
  const snapshot = await uploadBytes(fileRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Helper function to get current user email
export const getCurrentUserEmail = (): string => {
  const user = auth.currentUser;
  if (!user?.email) {
    throw new Error('User not authenticated');
  }
  return user.email;
};
