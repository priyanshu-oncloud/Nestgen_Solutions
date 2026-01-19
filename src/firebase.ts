// src/firebase.ts
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCuZS2_z8iIX9IPLxkOIVqUoAbCqyO7WVk",
  authDomain: "nestgen-solutions.firebaseapp.com",
  databaseURL: "https://nestgen-solutions-default-rtdb.firebaseio.com",
  projectId: "nestgen-solutions",
  storageBucket: "nestgen-solutions.firebasestorage.app",
  messagingSenderId: "285668258912",
  appId: "1:285668258912:web:1557582b21f1353cfdff05",
  measurementId: "G-5CM70GY8NW",
};

// ✅ Initialize Firebase App (lightweight, safe)
export const app: FirebaseApp = initializeApp(firebaseConfig);

// ✅ Core services (NON-blocking)
export const database = getDatabase(app);
export const storage = getStorage(app);

// 🚫 DO NOT auto-init analytics here
// Analytics must be loaded lazily to avoid LCP blocking
