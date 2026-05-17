import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDlYYa6Jj5kPXuMDrA9p21OST-tvPzV7ps",
  authDomain: "unity-firebase-d5d50.firebaseapp.com",
  projectId: "unity-firebase-d5d50",
  storageBucket: "unity-firebase-d5d50.firebasestorage.app",
  messagingSenderId: "182937126018",
  appId: "1:182937126018:web:6ae581da892fb6a129a09b",
  measurementId: "G-R72GLXK2QV",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);


export { firebaseConfig };