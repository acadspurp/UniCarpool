import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

export const CAMPUS_DOMAIN = "@iskolarngbayan.pup.edu.ph";

export const isCampusEmail = (email: string) =>
  email.toLowerCase().endsWith(CAMPUS_DOMAIN);

export async function signUp(email: string, password: string, fullName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = fullName.trim();
  if (!isCampusEmail(normalizedEmail)) {
    throw new Error(`Use your institutional email (${CAMPUS_DOMAIN})`);
  }
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  await updateProfile(userCredential.user, { displayName: normalizedName });
  return userCredential.user;
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export async function logout() {
  return signOut(auth);
}
