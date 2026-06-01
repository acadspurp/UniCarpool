import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SectionHeader } from "../ui/SectionHeader";
import { PrimaryButton } from "../ui/PrimaryButton";
import { OutlineButton } from "../ui/OutlineButton";
import { useAuthStore } from "../../store/authStore";
import {
  isActiveBookingStatus,
  requestBooking,
  subscribeRideBookings,
  subscribeRiderBookingForRide,
} from "../../services/bookings";
import { bookingChatId, ensureChat } from "../../services/chat";
import { getProfileOnce } from "../../services/profile";
import { updateRideStatus } from "../../services/rides";
import { confirmAction, showMessage } from "../../utils/alert";
import type { Booking, Ride } from "../../types/models";
import { colors } from "../../theme/colors";

type Props = {
  ride: Ride;
  navigation: { navigate: (screen: string, params?: object) => void; goBack: () => void };
};

export function RideDetailsActions({ ride, navigation }: Props) {
  const { user } = useAuthStore();
  const [deleting, setDeleting] = useState(false);
  const [booking, setBooking] = useState(false);
  const [myBooking, setMyBooking] = useState<Booking | null>(null);
  const [rideBookings, setRideBookings] = useState<Booking[]>([]);
  const [riderNames, setRiderNames] = useState<Record<string, string>>({});
  const [driverName, setDriverName] = useState("Driver");

  const isDriver = user?.uid === ride.driverId;
  const rideId = ride.id ?? "";

  const hasActiveRequest = myBooking != null && isActiveBookingStatus(myBooking.status);

  const incomingRequests = useMemo(
    () =>
      rideBookings.filter(
        (b) => b.status === "pending" || b.status === "accepted",
      ),
    [rideBookings],
  );

  useEffect(() => {
    if (!user || isDriver || !rideId) return;
    return subscribeRiderBookingForRide(rideId, user.uid, setMyBooking);
  }, [user, isDriver, rideId]);

  useEffect(() => {
    if (!isDriver || !rideId) return;
    return subscribeRideBookings(rideId, setRideBookings);
  }, [isDriver, rideId]);

  useEffect(() => {
    if (isDriver) return;
    getProfileOnce(ride.driverId).then((profile) => {
      setDriverName(profile?.fullName?.trim() || "Driver");
    });
  }, [isDriver, ride.driverId]);

  useEffect(() => {
    if (!isDriver || incomingRequests.length === 0) {
      setRiderNames({});
      return;
    }
    let cancelled = false;
    (async () => {
      const names: Record<string, string> = {};
      await Promise.all(
        incomingRequests.map(async (b) => {
          const profile = await getProfileOnce(b.riderId);
          names[b.riderId] = profile?.fullName?.trim() || "Rider";
        }),
      );
      if (!cancelled) setRiderNames(names);
    })();
    return () => {
      cancelled = true;
    };
  }, [isDriver, rideBookings]);

  const openRiderChat = () => {
    if (!myBooking?.id || !rideId) return;
    navigation.navigate("Chat", {
      chatId: bookingChatId(rideId, myBooking.id),
      peerName: driverName,
    });
  };

  const openDriverChat = (booking: Booking) => {
    if (!booking.id || !rideId) return;
    navigation.navigate("Chat", {
      chatId: bookingChatId(rideId, booking.id),
      peerName: riderNames[booking.riderId] || "Rider",
    });
  };

  const handleBook = async () => {
    if (!user || !rideId) return;
    if (isDriver) {
      showMessage("Not allowed", "Drivers cannot book their own rides.");
      return;
    }
    if (hasActiveRequest) {
      showMessage("Already requested", "You already have a seat request on this ride.");
      return;
    }
    try {
      setBooking(true);
      const bookingRef = await requestBooking(rideId, ride.driverId, user.uid, 1);
      const chatId = bookingChatId(rideId, bookingRef.id);
      await ensureChat(chatId, rideId, bookingRef.id, [ride.driverId, user.uid]);
      showMessage("Requested", "Seat request sent to the driver.");
    } catch (error: unknown) {
      showMessage(
        "Booking failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setBooking(false);
    }
  };

  const handleDelete = async () => {
    if (!rideId) return;

    const confirmed = await confirmAction({
      title: "Delete ride?",
      message: "This will remove your ride from Find Ride. Riders can no longer book it.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      setDeleting(true);
      await updateRideStatus(rideId, "cancelled");
      showMessage("Ride deleted", "Your ride has been removed.");
      navigation.goBack();
    } catch (error: unknown) {
      showMessage(
        "Could not delete ride",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (isDriver) {
    return (
      <View style={styles.wrap}>
        <SectionHeader
          title="Seat requests"
          subtitle="Riders who requested a seat on this ride. Open chat by name to coordinate."
        />
        {incomingRequests.length === 0 ? (
          <Text style={styles.hint}>No seat requests yet.</Text>
        ) : (
          incomingRequests.map((booking) => (
            <View key={booking.id} style={styles.requestRow}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>
                  {riderNames[booking.riderId] || "Rider"}
                </Text>
                <Text style={styles.requestMeta}>
                  {booking.seatsRequested} seat · {booking.status}
                </Text>
              </View>
              <OutlineButton
                label="MESSAGE"
                onPress={() => openDriverChat(booking)}
              />
            </View>
          ))
        )}
        <View style={styles.gap} />
        <OutlineButton label="DELETE RIDE" onPress={handleDelete} danger disabled={deleting} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <SectionHeader
        title="Ready to ride?"
        subtitle="Request a seat once, then chat with the driver to confirm pickup details."
      />
      <PrimaryButton
        label={hasActiveRequest ? "REQUEST SENT" : "REQUEST SEAT"}
        onPress={handleBook}
        loading={booking}
        disabled={hasActiveRequest || booking}
      />
      {hasActiveRequest && myBooking ? (
        <>
          <Text style={styles.statusNote}>
            Status: {myBooking.status} — waiting for the driver.
          </Text>
          <View style={styles.gap} />
          <OutlineButton label="OPEN CHAT" onPress={openRiderChat} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  gap: { height: 10 },
  hint: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  statusNote: { fontSize: 13, color: colors.textMuted, marginTop: 10, lineHeight: 18 },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  requestInfo: { flex: 1, minWidth: 0 },
  requestName: { fontSize: 15, fontWeight: "700", color: colors.text },
  requestMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2, textTransform: "capitalize" },
});
