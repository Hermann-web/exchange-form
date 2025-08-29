// src/firebase/index.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCbhEUbQSntk3BWpGgjE7_z8HC7Vp_8TgI',
  authDomain: 'mobility-ecc.firebaseapp.com',
  projectId: 'mobility-ecc',
  storageBucket: 'mobility-ecc.firebasestorage.app',
  messagingSenderId: '910871183745',
  appId: '1:910871183745:web:bee0d77d358e83d0de6880',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
