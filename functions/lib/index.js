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
exports.cleanupExpiredRides = exports.notifyOnNewMessage = exports.notifyOnBookingUpdate = exports.setCampusVerifiedClaim = exports.confirmCampusEmail = exports.autoVerifyCampusEmailOnSignup = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const functionsV1 = __importStar(require("firebase-functions/v1"));
const firebase_functions_1 = require("firebase-functions");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const CAMPUS_DOMAIN = "@iskolarngbayan.pup.edu.ph";
function isCampusEmail(email) {
    return !!email && email.toLowerCase().endsWith(CAMPUS_DOMAIN);
}
async function markCampusUserVerified(uid, email) {
    await admin.auth().updateUser(uid, { emailVerified: true });
    await admin.auth().setCustomUserClaims(uid, { campusVerified: true });
    firebase_functions_1.logger.info(`Campus user verified: ${uid} (${email})`);
}
/** Auto-verify institutional emails when inbox delivery is blocked (Spark-safe v1 trigger). */
exports.autoVerifyCampusEmailOnSignup = functionsV1.auth.user().onCreate(async (user) => {
    if (!isCampusEmail(user.email)) {
        firebase_functions_1.logger.info(`Skipped auto-verify for non-campus email: ${user.email}`);
        return;
    }
    await markCampusUserVerified(user.uid, user.email);
});
/**
 * Callable backup: user taps button if verification email never arrived.
 * Only works for signed-in users with @iskolarngbayan.pup.edu.ph on their token.
 */
exports.confirmCampusEmail = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be signed in.");
    }
    const email = request.auth.token.email;
    if (!isCampusEmail(email)) {
        throw new https_1.HttpsError("failed-precondition", `Only ${CAMPUS_DOMAIN} accounts can use campus verification.`);
    }
    await markCampusUserVerified(request.auth.uid, email);
    return { success: true, message: "Campus email marked verified." };
});
exports.setCampusVerifiedClaim = (0, firestore_1.onDocumentCreated)("users/{uid}", async (event) => {
    const uid = event.params.uid;
    const email = event.data?.data().email;
    if (!email)
        return;
    const campusVerified = isCampusEmail(email);
    await admin.auth().setCustomUserClaims(uid, { campusVerified });
    firebase_functions_1.logger.info(`Custom claim set for ${uid}: ${campusVerified}`);
});
exports.notifyOnBookingUpdate = (0, firestore_1.onDocumentUpdated)("bookings/{bookingId}", async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    if (!beforeData || !afterData)
        return;
    if (beforeData.status === afterData.status)
        return;
    firebase_functions_1.logger.info(`Booking ${event.params.bookingId} changed to ${afterData.status}`);
});
exports.notifyOnNewMessage = (0, firestore_1.onDocumentCreated)("chats/{chatId}/messages/{messageId}", async (event) => {
    const message = event.data?.data();
    if (!message)
        return;
    firebase_functions_1.logger.info(`New message in ${event.params.chatId} by ${message.senderId}`);
});
exports.cleanupExpiredRides = (0, scheduler_1.onSchedule)("every 24 hours", async () => {
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
    firebase_functions_1.logger.info(`Marked ${ridesSnap.size} open rides as completed.`);
});
//# sourceMappingURL=index.js.map