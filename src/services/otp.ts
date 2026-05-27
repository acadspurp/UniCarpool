import { auth } from "./firebase";

const apiBase = process.env.EXPO_PUBLIC_OTP_API_URL?.replace(/\/$/, "");
// Render free tier can sleep; the first request after wake may take a while.
const REQUEST_TIMEOUT_MS = 120000;

export class OtpApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "OtpApiError";
    this.code = code;
  }
}

async function getIdToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new OtpApiError("You must be signed in.", "unauthenticated");
  }
  return user.getIdToken();
}

async function otpRequest<T>(path: string, body?: { code: string }): Promise<T> {
  if (!apiBase) {
    throw new OtpApiError(
      "Verification API URL is not set. Add EXPO_PUBLIC_OTP_API_URL to .env (your Render service URL).",
      "failed-precondition",
    );
  }

  const token = await getIdToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new OtpApiError(
        "The verification server took too long to respond (Render may be waking up on free tier). Tap Resend and wait 1-2 minutes.",
        "deadline-exceeded",
      );
    }
    if (error instanceof Error) {
      throw new OtpApiError(
        `Could not reach verification server. ${error.message}`,
        "unavailable",
      );
    }
    throw new OtpApiError("Could not reach verification server.", "unavailable");
  } finally {
    clearTimeout(timeout);
  }

  let data: { error?: string; code?: string; message?: string } = {};
  try {
    data = await response.json();
  } catch {
    // ignore non-JSON body
  }

  if (!response.ok) {
    throw new OtpApiError(
      data.error ?? data.message ?? "Request failed.",
      data.code,
    );
  }

  return data as T;
}

export async function sendEmailOtp() {
  return otpRequest<{ success: boolean; message: string; expiresInMinutes: number }>(
    "/api/otp/send",
  );
}

export async function verifyEmailOtp(code: string) {
  const result = await otpRequest<{ success: boolean; message: string }>("/api/otp/verify", {
    code,
  });
  await auth.currentUser?.getIdToken(true);
  return result;
}
