import { useEffect, useState } from "react";
import { subscribeRide } from "../services/rides";
import type { Ride } from "../types/models";

export function useRide(rideId: string | undefined, initialRide: Ride) {
  const [ride, setRide] = useState<Ride>(initialRide);

  useEffect(() => {
    setRide(initialRide);
  }, [initialRide]);

  useEffect(() => {
    if (!rideId) return;
    return subscribeRide(rideId, (live) => {
      if (live) setRide(live);
    });
  }, [rideId]);

  return ride;
}
