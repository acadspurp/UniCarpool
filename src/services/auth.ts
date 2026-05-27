import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

export const CAMPUS_DOMAIN = "@iskolarngbayan.pup.edu.ph";

export const isCampusEmail = (email: string) =>
  email.toLowerCase().endsWith(CAMPUS_DOMAIN);

export async function signUp(email: string, password: string, fullName: string) {
  if (!isCampusEmail(email)) {
    throw new Error(`Use your institutional email (${CAMPUS_DOMAIN})`);
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: fullName });
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}
