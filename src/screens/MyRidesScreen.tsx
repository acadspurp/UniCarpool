import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAuthStore } from "../store/authStore";
import { subscribeMyBookings } from "../services/bookings";
import { subscribeDriverRides } from "../services/rides";
import { Booking, Ride } from "../types/models";
import { colors } from "../theme/colors";

export function MyRidesScreen() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [postedRides, setPostedRides] = useState<Ride[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubBookings = subscribeMyBookings(user.uid, setBookings);
    const unsubRides = subscribeDriverRides(user.uid, setPostedRides);
    return () => {
      unsubBookings();
      unsubRides();
    };
  }, [user]);

  return (
    <ScreenContainer>
      <SectionHeader
        title="My rides"
        subtitle="Rides you posted as a driver and bookings you requested as a rider."
      />

      <Text style={styles.sectionLabel}>Posted rides (Driver)</Text>
      {postedRides.length === 0 ? (
        <Text style={styles.empty}>No posted rides yet.</Text>
      ) : (
        postedRides.map((ride) => (
          <View key={ride.id} style={styles.card}>
            <Text style={styles.route}>
              {ride.origin.name} → {ride.destination.name}
            </Text>
            <Text style={styles.meta}>Departure: {ride.departureTime}</Text>
            <View style={[styles.badge, statusStyle(ride.status)]}>
              <Text style={styles.badgeText}>{ride.status}</Text>
            </View>
          </View>
        ))
      )}

      <Text style={[styles.sectionLabel, styles.sectionGap]}>My bookings (Rider)</Text>
      {bookings.length === 0 ? (
        <Text style={styles.empty}>No bookings yet.</Text>
      ) : (
        bookings.map((booking) => (
          <View key={booking.id} style={styles.card}>
            <Text style={styles.route}>Ride ID: {booking.rideId}</Text>
            <Text style={styles.meta}>Seats: {booking.seatsRequested}</Text>
            <View style={[styles.badge, statusStyle(booking.status)]}>
              <Text style={styles.badgeText}>{booking.status}</Text>
            </View>
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

function statusStyle(status: string) {
  if (status === "open" || status === "accepted") return { backgroundColor: "#E8F8EF" };
  if (status === "pending") return { backgroundColor: colors.surfaceMuted };
  return { backgroundColor: colors.accentSoft };
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 15, fontWeight: "700", color: colors.primaryDark, marginBottom: 10 },
  sectionGap: { marginTop: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  route: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  badge: { alignSelf: "flex-start", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.primaryDark, textTransform: "capitalize" },
  empty: { color: colors.textMuted, marginBottom: 8, fontSize: 13 },
});
