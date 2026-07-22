import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9uw99yvJcQqdQWnKA_sQP8nQ6-Hc0nug",
  authDomain: "krishi-ai-2c085.firebaseapp.com",
  projectId: "krishi-ai-2c085",
  storageBucket: "krishi-ai-2c085.firebasestorage.app",
  messagingSenderId: "442530563056",
  appId: "1:442530563056:web:e583845ad15daf0922d335",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
