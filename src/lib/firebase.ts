import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYs9Zc4x4ZDAo0D8j2YKLtVNcoxRwS-vI",
  authDomain: "lavacarwashapp.firebaseapp.com",
  projectId: "lavacarwashapp",
  storageBucket: "lavacarwashapp.appspot.com",
  messagingSenderId: "94669411635",
  appId: "1:94669411635:web:b6f7f0b06e1930b6af5a46",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
