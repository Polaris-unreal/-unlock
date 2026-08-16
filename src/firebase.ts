import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBOuGt66C0AnVC2FVBZnETCRTv4QRMzw6U",
  authDomain: "unlock-15fae.firebaseapp.com",
  projectId: "unlock-15fae",
  storageBucket: "unlock-15fae.firebasestorage.app",
  messagingSenderId: "565262825328",
  appId: "1:565262825328:web:a5796294a88e3bd7e141b5",
  measurementId: "G-SVECF21JLK"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
