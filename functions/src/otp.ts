import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import {sendOtpEmail} from "./email";

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

async function markUserVerified(uid: string, email: string) {
  await admin.auth().updateUser(uid, {emailVerified: true});
  await admin.auth().setCustomUserClaims(uid, {campusVerified: true});
  await admin.firestore().collection("emailOtps").doc(uid).delete();
}

export const sendEmailOtp = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const uid = request.auth.uid;
  const email = request.auth.token.email;
  if (!isCampusEmail(email)) {
    throw new HttpsError("failed-precondition", `Only ${CAMPUS_DOMAIN} emails are supported.`);
  }

  const otpRef = admin.firestore().collection("emailOtps").doc(uid);
  const existing = await otpRef.get();
  const now = Date.now();

  if (existing.exists) {
    const lastSentAt = existing.data()?.lastSentAt?.toMillis?.() ?? 0;
    if (now - lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000);
      throw new HttpsError("resource-exhausted", `Wait ${waitSec}s before requesting a new code.`);
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
    await sendOtpEmail({to: email!, code});
  } catch (error) {
    await otpRef.delete();
    throw new HttpsError("internal", (error as Error).message);
  }

  return {success: true, message: "Verification code sent.", expiresInMinutes: 10};
});

export const verifyEmailOtp = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const uid = request.auth.uid;
  const email = request.auth.token.email;
  const code = String(request.data?.code ?? "").trim();

  if (!/^\d{6}$/.test(code)) {
    throw new HttpsError("invalid-argument", "Enter the 6-digit code from your email.");
  }

  if (!isCampusEmail(email)) {
    throw new HttpsError("failed-precondition", `Only ${CAMPUS_DOMAIN} emails are supported.`);
  }

  const otpRef = admin.firestore().collection("emailOtps").doc(uid);
  const snap = await otpRef.get();

  if (!snap.exists) {
    throw new HttpsError("not-found", "No active code. Tap resend to get a new one.");
  }

  const data = snap.data()!;
  const attempts = (data.attempts as number) ?? 0;
  if (attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new HttpsError("resource-exhausted", "Too many wrong attempts. Resend a new code.");
  }

  const expiresAt = data.expiresAt?.toMillis?.() ?? 0;
  if (Date.now() > expiresAt) {
    await otpRef.delete();
    throw new HttpsError("deadline-exceeded", "Code expired. Resend a new code.");
  }

  const expectedHash = data.codeHash as string;
  if (hashOtp(uid, code) !== expectedHash) {
    await otpRef.update({attempts: attempts + 1});
    throw new HttpsError("invalid-argument", "Incorrect code. Try again.");
  }

  await markUserVerified(uid, email!);
  return {success: true, message: "Email verified."};
});
