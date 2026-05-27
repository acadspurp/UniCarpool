import { FirebaseError } from "firebase/app";
import { OtpApiError } from "../services/otp";

export function getOtpErrorMessage(error: unknown): string {
  if (error instanceof OtpApiError) {
    return error.message;
  }

  if (error instanceof FirebaseError) {
    if (error.message && !error.message.startsWith("functions/")) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Could not complete the request. Please try again.";
}

export function isOtpRateLimited(error: unknown): boolean {
  if (error instanceof OtpApiError) {
    return error.code === "resource-exhausted";
  }
  return error instanceof Object && "code" in error && error.code === "resource-exhausted";
}
