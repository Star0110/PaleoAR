import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  doc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from './firebase';

export const registerUser = async (
  name,
  email,
  password
) => {
  const response = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = response.user;

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    email,
    role: 'user',
    createdAt: new Date(),
    points: 0,
    level: 1,
  });
};

export const loginUser = async (
  email,
  password
) => {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const logoutUser = async () => {
  return await signOut(auth);
};