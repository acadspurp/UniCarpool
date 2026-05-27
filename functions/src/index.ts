import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as functionsV1 from "firebase-functions/v1";
import {logger} from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const CAMPUS_DOMAIN = "@iskolarngbayan.pup.edu.ph";

function isCampusEmail(email: string | undefined | null) {
  return !!email && email.toLowerCase().endsWith(CAMPUS_DOMAIN);
}

async function markCampusUserVerified(uid: string, email: string) {
  await admin.auth().updateUser(uid, {emailVerified: true});
  await admin.auth().setCustomUserClaims(uid, {campusVerified: true});
  logger.info(`Campus user verified: ${uid} (${email})`);
}

/** Auto-verify institutional emails when inbox delivery is blocked (Spark-safe v1 trigger). */
export const autoVerifyCampusEmailOnSignup = functionsV1.auth.user().onCreate(async (user) => {
  if (!isCampusEmail(user.email)) {
    logger.info(`Skipped auto-verify for non-campus email: ${user.email}`);
    return;
  }
  await markCampusUserVerified(user.uid, user.email!);
});

/**
 * Callable backup: user taps button if verification email never arrived.
 * Only works for signed-in users with @iskolarngbayan.pup.edu.ph on their token.
 */
export const confirmCampusEmail = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  const email = request.auth.token.email;
  if (!isCampusEmail(email)) {
    throw new HttpsError(
      "failed-precondition",
      `Only ${CAMPUS_DOMAIN} accounts can use campus verification.`,
    );
  }
  await markCampusUserVerified(request.auth.uid, email!);
  return {success: true, message: "Campus email marked verified."};
});

export const setCampusVerifiedClaim = onDocumentCreated("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const email = event.data?.data().email as string | undefined;
  if (!email) return;
  const campusVerified = isCampusEmail(email);
  await admin.auth().setCustomUserClaims(uid, {campusVerified});
  logger.info(`Custom claim set for ${uid}: ${campusVerified}`);
});

export const notifyOnBookingUpdate = onDocumentUpdated("bookings/{bookingId}", async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  if (!beforeData || !afterData) return;
  if (beforeData.status === afterData.status) return;
  logger.info(`Booking ${event.params.bookingId} changed to ${afterData.status}`);
});

export const notifyOnNewMessage = onDocumentCreated("chats/{chatId}/messages/{messageId}", async (event) => {
  const message = event.data?.data();
  if (!message) return;
  logger.info(`New message in ${event.params.chatId} by ${message.senderId}`);
});

export const cleanupExpiredRides = onSchedule("every 24 hours", async () => {
  const now = admin.firestore.Timestamp.now();
  const ridesSnap = await admin.firestore()
    .collection("rides")
    .where("status", "==", "open")
    .where("departureTime", "<", now)
    .get();

  const batch = admin.firestore().batch();
  ridesSnap.docs.forEach((rideDoc) => {
    batch.update(rideDoc.ref, {
      status: "completed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  logger.info(`Marked ${ridesSnap.size} open rides as completed.`);
});
