import * as crypto from "crypto";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdmin } from "./firebase";
import { sendOtpEmail } from "./email";
import { ApiError } from "./errors";

const CAMPUS_DOMAIN = "@iskolarngbayan.pup.edu.ph";
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

function isCampusEmail(email: string | undefined | null) {
  return !!email && email.toLowerCase().endsWith(CAMPUS_DOMAIN);
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(uid: string, code: string) {
  return crypto.createHash("sha256").update(`${uid}:${code}:unicarpool`).digest("hex");
}

async function markUserVerified(uid: string) {
  const admin = getAdmin();
  await admin.auth().updateUser(uid, { emailVerified: true });
  await admin.auth().setCustomUserClaims(uid, { campusVerified: true });
  await admin.firestore().collection("emailOtps").doc(uid).delete();
}

export async function handleSendOtp(decoded: DecodedIdToken) {
  const uid = decoded.uid;
  const email = decoded.email;
  if (!isCampusEmail(email)) {
    throw new ApiError(400, "failed-precondition", `Only ${CAMPUS_DOMAIN} emails are supported.`);
  }

  const admin = getAdmin();
  const otpRef = admin.firestore().collection("emailOtps").doc(uid);
  const existing = await otpRef.get();
  const now = Date.now();

  if (existing.exists) {
    const lastSentAt = existing.data()?.lastSentAt?.toMillis?.() ?? 0;
    if (now - lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000);
      throw new ApiError(429, "resource-exhausted", `Wait ${waitSec}s before requesting a new code.`);
    }
  }

  const code = generateOtpCode();
  const expiresAt = admin.firestore.Timestamp.fromMillis(now + OTP_TTL_MS);

  await otpRef.set({
    codeHash: hashOtp(uid, code),
    expiresAt,
    lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
    attempts: 0,
    email,
  });

  try {
    await sendOtpEmail({ to: email!, code });
  } catch (error) {
    await otpRef.delete();
    throw new ApiError(
      400,
      "failed-precondition",
      (error as Error).message || "Could not send verification email.",
    );
  }

  return { success: true, message: "Verification code sent.", expiresInMinutes: 10 };
}

export async function handleVerifyOtp(decoded: DecodedIdToken, rawCode: unknown) {
  const uid = decoded.uid;
  const email = decoded.email;
  const code = String(rawCode ?? "").trim();

  if (!/^\d{6}$/.test(code)) {
    throw new ApiError(400, "invalid-argument", "Enter the 6-digit code from your email.");
  }

  if (!isCampusEmail(email)) {
    throw new ApiError(400, "failed-precondition", `Only ${CAMPUS_DOMAIN} emails are supported.`);
  }

  const admin = getAdmin();
  const otpRef = admin.firestore().collection("emailOtps").doc(uid);
  const snap = await otpRef.get();

  if (!snap.exists) {
    throw new ApiError(404, "not-found", "No active code. Tap resend to get a new one.");
  }

  const data = snap.data()!;
  const attempts = (data.attempts as number) ?? 0;
  if (attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new ApiError(429, "resource-exhausted", "Too many wrong attempts. Resend a new code.");
  }

  const expiresAt = data.expiresAt?.toMillis?.() ?? 0;
  if (Date.now() > expiresAt) {
    await otpRef.delete();
    throw new ApiError(410, "deadline-exceeded", "Code expired. Resend a new code.");
  }

  const expectedHash = data.codeHash as string;
  if (hashOtp(uid, code) !== expectedHash) {
    await otpRef.update({ attempts: attempts + 1 });
    throw new ApiError(400, "invalid-argument", "Incorrect code. Try again.");
  }

  await markUserVerified(uid);
  return { success: true, message: "Email verified." };
}
