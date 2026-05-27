"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailOtp = exports.sendEmailOtp = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const email_1 = require("./email");
const CAMPUS_DOMAIN = "@iskolarngbayan.pup.edu.ph";
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
function isCampusEmail(email) {
    return !!email && email.toLowerCase().endsWith(CAMPUS_DOMAIN);
}
function generateOtpCode() {
    return String(crypto.randomInt(100000, 1000000));
}
function hashOtp(uid, code) {
    return crypto.createHash("sha256").update(`${uid}:${code}:unicarpool`).digest("hex");
}
async function markUserVerified(uid, email) {
    await admin.auth().updateUser(uid, { emailVerified: true });
    await admin.auth().setCustomUserClaims(uid, { campusVerified: true });
    await admin.firestore().collection("emailOtps").doc(uid).delete();
}
exports.sendEmailOtp = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be signed in.");
    }
    const uid = request.auth.uid;
    const email = request.auth.token.email;
    if (!isCampusEmail(email)) {
        throw new https_1.HttpsError("failed-precondition", `Only ${CAMPUS_DOMAIN} emails are supported.`);
    }
    const otpRef = admin.firestore().collection("emailOtps").doc(uid);
    const existing = await otpRef.get();
    const now = Date.now();
    if (existing.exists) {
        const lastSentAt = existing.data()?.lastSentAt?.toMillis?.() ?? 0;
        if (now - lastSentAt < RESEND_COOLDOWN_MS) {
            const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000);
            throw new https_1.HttpsError("resource-exhausted", `Wait ${waitSec}s before requesting a new code.`);
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
        await (0, email_1.sendOtpEmail)({ to: email, code });
    }
    catch (error) {
        await otpRef.delete();
        throw new https_1.HttpsError("internal", error.message);
    }
    return { success: true, message: "Verification code sent.", expiresInMinutes: 10 };
});
exports.verifyEmailOtp = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be signed in.");
    }
    const uid = request.auth.uid;
    const email = request.auth.token.email;
    const code = String(request.data?.code ?? "").trim();
    if (!/^\d{6}$/.test(code)) {
        throw new https_1.HttpsError("invalid-argument", "Enter the 6-digit code from your email.");
    }
    if (!isCampusEmail(email)) {
        throw new https_1.HttpsError("failed-precondition", `Only ${CAMPUS_DOMAIN} emails are supported.`);
    }
    const otpRef = admin.firestore().collection("emailOtps").doc(uid);
    const snap = await otpRef.get();
    if (!snap.exists) {
        throw new https_1.HttpsError("not-found", "No active code. Tap resend to get a new one.");
    }
    const data = snap.data();
    const attempts = data.attempts ?? 0;
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
        throw new https_1.HttpsError("resource-exhausted", "Too many wrong attempts. Resend a new code.");
    }
    const expiresAt = data.expiresAt?.toMillis?.() ?? 0;
    if (Date.now() > expiresAt) {
        await otpRef.delete();
        throw new https_1.HttpsError("deadline-exceeded", "Code expired. Resend a new code.");
    }
    const expectedHash = data.codeHash;
    if (hashOtp(uid, code) !== expectedHash) {
        await otpRef.update({ attempts: attempts + 1 });
        throw new https_1.HttpsError("invalid-argument", "Incorrect code. Try again.");
    }
    await markUserVerified(uid, email);
    return { success: true, message: "Email verified." };
});
//# sourceMappingURL=otp.js.map