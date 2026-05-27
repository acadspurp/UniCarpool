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
  const baseQuery = destinationName
    ? query(
        collection(db, "rides"),
        where("status", "==", "open"),
        where("destination.name", "==", destinationName),
        orderBy("departureTime", "asc"),
      )
    : query(
        collection(db, "rides"),
        where("status", "==", "open"),
        orderBy("departureTime", "asc"),
      );
  return onSnapshot(baseQuery, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Ride) })));
  });
}

export async function updateRideStatus(rideId: string, status: Ride["status"]) {
  const rideRef = doc(db, "rides", rideId);
  return updateDoc(rideRef, { status, updatedAt: serverTimestamp() });
}

export function subscribeDriverRides(driverId: string, cb: (rides: Ride[]) => void) {
  const ridesQuery = query(collection(db, "rides"), where("driverId", "==", driverId));
  return onSnapshot(ridesQuery, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Ride) })));
  });
}
