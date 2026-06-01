import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Ride } from "../types/models";

export async function postRide(rideData: Omit<Ride, "createdAt" | "updatedAt">) {
  const ridesRef = collection(db, "rides");
  return addDoc(ridesRef, {
    ...rideData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeOpenRides(
  cb: (rides: Ride[]) => void,
  destinationName?: string,
) {
  const normalizedDestination = destinationName?.trim().toUpperCase() || "";
  const ridesQuery = query(collection(db, "rides"), where("status", "==", "open"));

  return onSnapshot(ridesQuery, (snapshot) => {
    const allOpenRides = snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as Ride) }))
      .filter((ride) => ride.availableSeats > 0);
    const filtered = normalizedDestination
      ? allOpenRides.filter((ride) =>
          ride.destination?.name?.toUpperCase().includes(normalizedDestination),
        )
      : allOpenRides;

    filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    cb(filtered);
  });
}

export async function updateRideStatus(rideId: string, status: Ride["status"]) {
  const rideRef = doc(db, "rides", rideId);
  return updateDoc(rideRef, { status, updatedAt: serverTimestamp() });
}

export async function updateRideAvailability(
  rideId: string,
  availableSeats: number,
  status?: Ride["status"],
  totalSeats?: number,
) {
  const rideRef = doc(db, "rides", rideId);
  const payload: {
    availableSeats: number;
    updatedAt: ReturnType<typeof serverTimestamp>;
    status?: Ride["status"];
    totalSeats?: number;
  } = {
    availableSeats: Math.max(0, availableSeats),
    updatedAt: serverTimestamp(),
  };
  if (status) {
    payload.status = status;
  }
  if (totalSeats != null) {
    payload.totalSeats = totalSeats;
  }
  return updateDoc(rideRef, payload);
}

export function getRideTotalSeats(ride: Ride) {
  return ride.totalSeats ?? ride.availableSeats;
}

export function subscribeRide(rideId: string, cb: (ride: Ride | null) => void) {
  const rideRef = doc(db, "rides", rideId);
  return onSnapshot(rideRef, (snapshot) => {
    if (!snapshot.exists()) {
      cb(null);
      return;
    }
    cb({ id: snapshot.id, ...(snapshot.data() as Ride) });
  });
}

export function subscribeDriverRides(driverId: string, cb: (rides: Ride[]) => void) {
  const ridesQuery = query(collection(db, "rides"), where("driverId", "==", driverId));
  return onSnapshot(ridesQuery, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Ride) })));
  });
}
