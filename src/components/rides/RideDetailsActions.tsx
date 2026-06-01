import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SectionHeader } from "../ui/SectionHeader";
import { PrimaryButton } from "../ui/PrimaryButton";
import { OutlineButton } from "../ui/OutlineButton";
import { useAuthStore } from "../../store/authStore";
import {
  acceptBookingRequest,
  countAcceptedSeatsFromBookings,
  isActiveBookingStatus,
  rejectBookingRequest,
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
  const [actingBookingId, setActingBookingId] = useState<string | null>(null);

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
    return subscribeRideBookings(rideId, ride.driverId, setRideBookings);
  }, [isDriver, rideId, ride.driverId]);

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

  const handleAccept = async (booking: Booking) => {
    if (!booking.id) return;
    try {
      setActingBookingId(booking.id);
      const seatsTaken = countAcceptedSeatsFromBookings(rideBookings);
      await acceptBookingRequest(booking, ride, seatsTaken);
      showMessage("Request accepted", `${riderNames[booking.riderId] || "Rider"} is confirmed for this ride.`);
    } catch (error: unknown) {
      showMessage(
        "Could not accept",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setActingBookingId(null);
    }
  };

  const handleDecline = async (booking: Booking) => {
    if (!booking.id) return;
    const confirmed = await confirmAction({
      title: "Decline request?",
      message: `Decline ${riderNames[booking.riderId] || "this rider"}'s seat request?`,
      confirmLabel: "Decline",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      setActingBookingId(booking.id);
      await rejectBookingRequest(booking.id);
      showMessage("Request declined", "The rider has been notified in the app.");
    } catch (error: unknown) {
      showMessage(
        "Could not decline",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setActingBookingId(null);
    }
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
    const seatsLeft = Math.max(0, ride.availableSeats);
    if (ride.status !== "open" || seatsLeft < 1) {
      showMessage("Ride full", "This ride has no seats left.");
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
          subtitle="Accept or decline riders who requested a seat, then message them to coordinate pickup."
        />
        {incomingRequests.length === 0 ? (
          <Text style={styles.hint}>No seat requests yet.</Text>
        ) : (
          incomingRequests.map((booking) => {
            const isPending = booking.status === "pending";
            const busy = actingBookingId === booking.id;

            return (
              <View key={booking.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>
                      {riderNames[booking.riderId] || "Rider"}
                    </Text>
                    <Text style={styles.requestMeta}>
                      {booking.seatsRequested} seat{booking.seatsRequested === 1 ? "" : "s"} ·{" "}
                      {booking.status}
                    </Text>
                  </View>
                  {booking.status === "accepted" ? (
                    <View style={styles.acceptedBadge}>
                      <Text style={styles.acceptedBadgeText}>Accepted</Text>
                    </View>
                  ) : null}
                </View>
                {isPending ? (
                  <View style={styles.requestActions}>
                    <View style={styles.actionBtn}>
                      <PrimaryButton
                        label="ACCEPT"
                        onPress={() => handleAccept(booking)}
                        loading={busy}
                        disabled={actingBookingId != null && !busy}
                      />
                    </View>
                    <View style={styles.actionBtn}>
                      <OutlineButton
                        label="DECLINE"
                        danger
                        onPress={() => handleDecline(booking)}
                        disabled={busy || actingBookingId != null}
                      />
                    </View>
                  </View>
                ) : null}
                <OutlineButton
                  label="MESSAGE"
                  onPress={() => openDriverChat(booking)}
                  disabled={busy}
                />
              </View>
            );
          })
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
            {myBooking.status === "pending"
              ? "Status: pending — waiting for the driver to accept."
              : myBooking.status === "accepted"
                ? "Status: accepted — you are confirmed for this ride."
                : `Status: ${myBooking.status}`}
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
  requestCard: {
    paddingVertical: 12,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  requestInfo: { flex: 1, minWidth: 0 },
  requestName: { fontSize: 15, fontWeight: "700", color: colors.text },
  requestMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2, textTransform: "capitalize" },
  acceptedBadge: {
    backgroundColor: "#E8F8EF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  acceptedBadgeText: { fontSize: 11, fontWeight: "700", color: colors.success },
  requestActions: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1 },
});
