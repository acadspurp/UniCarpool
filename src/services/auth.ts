import {
  ActionCodeSettings,
  User,
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

/** Web: link opens your app URL after the user clicks the email link. */
export function getVerificationActionSettings(): ActionCodeSettings | undefined {
  if (typeof window !== "undefined" && window.location?.origin) {
    return {
      url: window.location.origin,
      handleCodeInApp: false,
    };
  }
  return undefined;
}

export async function sendCampusVerificationEmail(user: User) {
  const settings = getVerificationActionSettings();
  if (settings) {
    await sendEmailVerification(user, settings);
  } else {
    await sendEmailVerification(user);
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  if (!isCampusEmail(email)) {
    throw new Error(`Use your institutional email (${CAMPUS_DOMAIN})`);
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: fullName });
  await sendCampusVerificationEmail(userCredential.user);
  return userCredential.user;
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}
