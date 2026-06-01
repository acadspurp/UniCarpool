import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { EmptyState } from "../components/ui/EmptyState";
import { OutlineButton } from "../components/ui/OutlineButton";
import { useAuthStore } from "../store/authStore";
import { isActiveBookingStatus, subscribeMyBookings } from "../services/bookings";
import { bookingChatId } from "../services/chat";
import { getProfileOnce } from "../services/profile";
import { subscribeDriverRides } from "../services/rides";
import { Booking, Ride } from "../types/models";
import { formatDepartureLabel } from "../utils/date";
import { colors } from "../theme/colors";

export function MyRidesScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [postedRides, setPostedRides] = useState<Ride[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubBookings = subscribeMyBookings(user.uid, setBookings);
    const unsubRides = subscribeDriverRides(user.uid, setPostedRides);
    return () => {
      unsubBookings();
      unsubRides();
    };
  }, [user]);

  const filterByHistory = <T extends { status: string }>(items: T[]) =>
    showHistory
      ? items.filter((i) => i.status === "completed" || i.status === "cancelled")
      : items.filter((i) => i.status !== "completed" && i.status !== "cancelled");

  const visibleRides = filterByHistory(postedRides);
  const visibleBookings = filterByHistory(bookings);

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>My rides</Text>
          <Text style={styles.subtitle}>Trips you offer and seats you booked.</Text>
        </View>
        <Pressable onPress={() => setShowHistory((v) => !v)} style={styles.historyToggle}>
          <Text style={styles.historyText}>{showHistory ? "Active" : "History"}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>🚗 Rides I'm offering</Text>
      {visibleRides.length === 0 ? (
        <EmptyState
          emoji="🛞"
          title={showHistory ? "No ride history" : "No posted rides"}
          message={
            showHistory
              ? "Completed or cancelled rides you offered will appear here."
              : "Post a ride from Home to start offering seats."
          }
        />
      ) : (
        visibleRides.map((ride) => (
          <View key={ride.id} style={styles.card}>
            <Text style={styles.route}>
              {ride.origin.name} → {ride.destination.name}
            </Text>
            <Text style={styles.meta}>{formatDepartureLabel(ride.departureTime)}</Text>
            <View style={styles.cardFooter}>
              <View style={[styles.badge, statusStyle(ride.status)]}>
                <Text style={styles.badgeText}>{ride.status}</Text>
              </View>
              <OutlineButton
                label="VIEW DETAILS"
                onPress={() =>
                  navigation.navigate("RideDetails", { rideId: ride.id, ride })
                }
              />
            </View>
          </View>
        ))
      )}

      <Text style={[styles.sectionLabel, styles.sectionGap]}>💺 Rides I've booked</Text>
      {visibleBookings.length === 0 ? (
        <EmptyState
          emoji="🪑"
          title={showHistory ? "No booking history" : "No bookings yet"}
          message={
            showHistory
              ? "Past bookings will show up here once completed or cancelled."
              : "Find a ride and request a seat to see your bookings here."
          }
        />
      ) : (
        visibleBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} navigation={navigation} />
        ))
      )}
    </ScreenContainer>
  );
}

function BookingCard({
  booking,
  navigation,
}: {
  booking: Booking;
  navigation: { navigate: (screen: string, params?: object) => void };
}) {
  const [driverName, setDriverName] = useState("Driver");

  useEffect(() => {
    getProfileOnce(booking.driverId).then((profile) => {
      setDriverName(profile?.fullName?.trim() || "Driver");
    });
  }, [booking.driverId]);

  const openChat = () => {
    if (!booking.id || !booking.rideId) return;
    navigation.navigate("Chat", {
      chatId: bookingChatId(booking.rideId, booking.id),
      peerName: driverName,
    });
  };

  return (
    <View style={[styles.card, styles.bookingCard]}>
      <Text style={styles.route}>Booking · {booking.seatsRequested} seat(s)</Text>
      <Text style={styles.meta}>
        Ride ID: {booking.rideId ? `${booking.rideId.slice(0, 8)}…` : "—"}
      </Text>
      <View style={styles.cardFooter}>
        <View style={[styles.badge, statusStyle(booking.status)]}>
          <Text style={styles.badgeText}>{booking.status}</Text>
        </View>
        {isActiveBookingStatus(booking.status) ? (
          <OutlineButton label="OPEN CHAT" onPress={openChat} />
        ) : null}
      </View>
    </View>
  );
}

function statusStyle(status: string) {
  if (status === "open" || status === "accepted") return { backgroundColor: "#E8F8EF" };
  if (status === "pending") return { backgroundColor: colors.surfaceMuted };
  return { backgroundColor: colors.accentSoft };
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  historyToggle: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  historyText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  sectionLabel: { fontSize: 15, fontWeight: "700", color: colors.primaryDark, marginBottom: 8 },
  sectionGap: { marginTop: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingCard: { borderLeftWidth: 3, borderLeftColor: colors.accent },
  route: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.textMuted, marginBottom: 10 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.primaryDark, textTransform: "capitalize" },
});
