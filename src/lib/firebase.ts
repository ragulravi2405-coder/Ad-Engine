import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Shared Firebase Configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyAKyjZme895uJSF6s3e0PaXjyo_O3SMmbI",
  authDomain: "data-ed0d6.firebaseapp.com",
  projectId: "data-ed0d6",
  storageBucket: "data-ed0d6.firebasestorage.app",
  messagingSenderId: "880498169859",
  appId: "1:880498169859:web:43a78ba997f10c4f351636"
};

// Initialize app with fallback safe checking
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
