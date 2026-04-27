// src/firebase.ts
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCuZS2_z8iIX9IPLxkOIVqUoAbCqyO7WVk",
  authDomain: "nestgen-solutions.firebaseapp.com",
  projectId: "nestgen-solutions",
  storageBucket: "nestgen-solutions.firebasestorage.app",
  messagingSenderId: "285668258912",
  appId: "1:285668258912:web:1557582b21f1353cfdff05",
};

// Initialize App
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const database = getDatabase(app);   // ✅ FIXED
export const firestore = getFirestore(app); // optional
export const storage = getStorage(app);     // ✅ FIXED