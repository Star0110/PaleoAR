// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlYYa6Jj5kPXuMDrA9p21OST-tvPzV7ps",
  authDomain: "unity-firebase-d5d50.firebaseapp.com",
  projectId: "unity-firebase-d5d50",
  storageBucket: "unity-firebase-d5d50.firebasestorage.app",
  messagingSenderId: "182937126018",
  appId: "1:182937126018:web:6ae581da892fb6a129a09b",
  measurementId: "G-R72GLXK2QV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);