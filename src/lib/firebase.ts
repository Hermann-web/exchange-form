// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCbhEUbQSntk3BWpGgjE7_z8HC7Vp_8TgI',
  authDomain: 'mobility-ecc.firebaseapp.com',
  projectId: 'mobility-ecc',
  storageBucket: 'mobility-ecc.firebasestorage.app',
  messagingSenderId: '910871183745',
  appId: '1:910871183745:web:bee0d77d358e83d0de6880',
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
