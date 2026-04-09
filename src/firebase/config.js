import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBZ-DrZ6KcmSpYJR0xNmAeuEztKoABco7g",
  authDomain: "think-tank-ed73f.firebaseapp.com",
  projectId: "think-tank-ed73f",
  storageBucket: "think-tank-ed73f.firebasestorage.app",
  messagingSenderId: "232599790361",
  appId: "1:232599790361:web:1719749adb2c749a455b88",
  measurementId: "G-C33EVM9VPP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
