import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { subscribeDriverBookings, subscribeMyBookings } from "../services/bookings";
import type { Booking } from "../types/models";

export function useBookingActivity() {
  const { user } = useAuthStore();
  const [riderBookings, setRiderBookings] = useState<Booking[]>([]);
  const [driverBookings, setDriverBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) {
      setRiderBookings([]);
      setDriverBookings([]);
      return;
    }
    const unsubRider = subscribeMyBookings(user.uid, setRiderBookings);
    const unsubDriver = subscribeDriverBookings(user.uid, setDriverBookings);
    return () => {
      unsubRider();
      unsubDriver();
    };
  }, [user]);

  const pendingDriverCount = useMemo(
    () => driverBookings.filter((b) => b.status === "pending").length,
    [driverBookings],
  );

  return { riderBookings, driverBookings, pendingDriverCount };
}
