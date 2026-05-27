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
exports.cleanupExpiredRides = exports.notifyOnNewMessage = exports.notifyOnBookingUpdate = exports.setCampusVerifiedClaim = exports.verifyEmailOtp = exports.sendEmailOtp = void 0;
var otp_1 = require("./otp");
Object.defineProperty(exports, "sendEmailOtp", { enumerable: true, get: function () { return otp_1.sendEmailOtp; } });
Object.defineProperty(exports, "verifyEmailOtp", { enumerable: true, get: function () { return otp_1.verifyEmailOtp; } });
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const CAMPUS_DOMAIN = "@iskolarngbayan.pup.edu.ph";
exports.setCampusVerifiedClaim = (0, firestore_1.onDocumentCreated)("users/{uid}", async (event) => {
    const uid = event.params.uid;
    const email = event.data?.data().email;
    if (!email)
        return;
    const campusVerified = email.toLowerCase().endsWith(CAMPUS_DOMAIN);
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