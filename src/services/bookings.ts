import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Booking } from "../types/models";

export async function requestBooking(
  rideId: string,
  driverId: string,
  riderId: string,
  seatsRequested: number,
  pickupNote?: string,
) {
  return addDoc(collection(db, "bookings"), {
    rideId,
    driverId,
    riderId,
    seatsRequested,
    status: "pending",
    pickupNote: pickupNote ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"],
) {
  return updateDoc(doc(db, "bookings", bookingId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeMyBookings(uid: string, cb: (bookings: Booking[]) => void) {
  const bookingsQuery = query(collection(db, "bookings"), where("riderId", "==", uid));
  return onSnapshot(bookingsQuery, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Booking) })));
  });
}

export function subscribeDriverBookings(driverId: string, cb: (bookings: Booking[]) => void) {
  const bookingsQuery = query(collection(db, "bookings"), where("driverId", "==", driverId));
  return onSnapshot(bookingsQuery, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Booking) })));
  });
}
