import {
  ActionCodeSettings,
  User,
  applyActionCode,
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

/**
 * URL opened after the user clicks the verification link in their email.
 * Must be listed under Firebase Console → Authentication → Settings → Authorized domains.
 */
export function getVerificationActionSettings(): ActionCodeSettings {
  const fromEnv = process.env.EXPO_PUBLIC_EMAIL_VERIFY_CONTINUE_URL?.trim();
  let url = fromEnv;

  if (!url && typeof window !== "undefined") {
    url = `${window.location.origin}${window.location.pathname}`;
  }

  if (!url) {
    url = "http://localhost:8081";
  }

  return {
    url,
    handleCodeInApp: false,
  };
}

export async function sendCampusVerificationEmail(user: User) {
  auth.languageCode = "en";
  const settings = getVerificationActionSettings();
  await sendEmailVerification(user, settings);
}

export async function completeEmailVerificationFromLink(oobCode: string) {
  await applyActionCode(auth, oobCode);
  await auth.currentUser?.reload();
  return auth.currentUser;
}

export function getEmailVerificationLinkParams(): { mode: string | null; oobCode: string | null } {
  if (typeof window === "undefined") {
    return { mode: null, oobCode: null };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get("mode"),
    oobCode: params.get("oobCode"),
  };
}

export function clearEmailVerificationQueryParams() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("mode");
  url.searchParams.delete("oobCode");
  url.searchParams.delete("apiKey");
  url.searchParams.delete("lang");
  window.history.replaceState({}, "", url.toString());
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
