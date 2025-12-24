// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCuZS2_z8iIX9IPLxkOIVqUoAbCqyO7WVk",
  authDomain: "nestgen-solutions.firebaseapp.com",
  
  // ✅ Realtime Database
  databaseURL: "https://nestgen-solutions-default-rtdb.firebaseio.com",

  projectId: "nestgen-solutions",

  // ✅ Storage bucket (GS URL se linked)
  storageBucket: "nestgen-solutions.firebasestorage.app",
  
  messagingSenderId: "285668258912",
  appId: "1:285668258912:web:1557582b21f1353cfdff05",
  measurementId: "G-5CM70GY8NW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Exports
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
export const storage = getStorage(app); // 🔥 MOST IMPORTANT
