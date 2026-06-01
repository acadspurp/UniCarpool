import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { updateRideStatus } from "./rides";
import { Booking, Ride } from "../types/models";

const ACTIVE_BOOKING_STATUSES: Booking["status"][] = ["pending", "accepted"];

export function isActiveBookingStatus(status: Booking["status"]) {
  return ACTIVE_BOOKING_STATUSES.includes(status);
}

export async function requestBooking(
  rideId: string,
  driverId: string,
  riderId: string,
  seatsRequested: number,
  pickupNote?: string,
) {
  const existing = await getDocs(
    query(
      collection(db, "bookings"),
      where("rideId", "==", rideId),
      where("riderId", "==", riderId),
    ),
  );
  const duplicate = existing.docs.find((d) =>
    isActiveBookingStatus(d.data().status as Booking["status"]),
  );
  if (duplicate) {
    throw new Error("You already requested a seat on this ride.");
  }

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

export function countAcceptedSeatsFromBookings(bookings: Booking[]) {
  return bookings
    .filter((b) => b.status === "accepted")
    .reduce((sum, b) => sum + b.seatsRequested, 0);
}

export async function acceptBookingRequest(
  booking: Booking,
  ride: Ride,
  acceptedSeatsOnRide: number,
) {
  if (!booking.id || !ride.id) {
    throw new Error("Invalid booking.");
  }
  if (booking.status !== "pending") {
    throw new Error("This request is no longer pending.");
  }

  const seatsAfter = acceptedSeatsOnRide + booking.seatsRequested;
  if (seatsAfter > ride.availableSeats) {
    throw new Error("Not enough seats left on this ride.");
  }

  await updateBookingStatus(booking.id, "accepted");

  if (seatsAfter >= ride.availableSeats) {
    await updateRideStatus(ride.id, "full");
  }
}

export async function rejectBookingRequest(bookingId: string) {
  return updateBookingStatus(bookingId, "rejected");
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

export function subscribeRideBookings(
  rideId: string,
  driverId: string,
  cb: (bookings: Booking[]) => void,
) {
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("rideId", "==", rideId),
    where("driverId", "==", driverId),
  );
  return onSnapshot(bookingsQuery, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Booking) })));
  });
}

export function subscribeRiderBookingForRide(
  rideId: string,
  riderId: string,
  cb: (booking: Booking | null) => void,
) {
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("rideId", "==", rideId),
    where("riderId", "==", riderId),
  );
  return onSnapshot(bookingsQuery, (snapshot) => {
    const active =
      snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as Booking) }))
        .find((b) => isActiveBookingStatus(b.status)) ?? null;
    cb(active);
  });
}
