import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {logger} from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const CAMPUS_DOMAIN = "@iskolarngbayan.pup.edu.ph";

export const setCampusVerifiedClaim = onDocumentCreated("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const email = event.data?.data().email as string | undefined;
  if (!email) return;
  const campusVerified = email.toLowerCase().endsWith(CAMPUS_DOMAIN);
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
