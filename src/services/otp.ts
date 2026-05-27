import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export async function sendEmailOtp() {
  const callable = httpsCallable(functions, "sendEmailOtp");
  const result = await callable();
  return result.data as { success: boolean; message: string; expiresInMinutes: number };
}

export async function verifyEmailOtp(code: string) {
  const callable = httpsCallable(functions, "verifyEmailOtp");
  const result = await callable({ code });
  return result.data as { success: boolean; message: string };
}
