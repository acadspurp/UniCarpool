import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SectionHeader } from "../ui/SectionHeader";
import { PrimaryButton } from "../ui/PrimaryButton";
import { OutlineButton } from "../ui/OutlineButton";
import { useAuthStore } from "../../store/authStore";
import { requestBooking } from "../../services/bookings";
import { ensureChat } from "../../services/chat";
import { updateRideStatus } from "../../services/rides";
import { confirmAction, showMessage } from "../../utils/alert";
import type { Ride } from "../../types/models";

type Props = {
  ride: Ride;
  navigation: { navigate: (screen: string, params?: object) => void; goBack: () => void };
};

export function RideDetailsActions({ ride, navigation }: Props) {
  const { user } = useAuthStore();
  const [deleting, setDeleting] = useState(false);
  const [booking, setBooking] = useState(false);
  const isDriver = user?.uid === ride.driverId;

  const openChat = () => {
    navigation.navigate("Chat", { chatId: `${ride.id}_direct` });
  };

  const handleBook = async () => {
    if (!user) return;
    if (isDriver) {
      showMessage("Not allowed", "Drivers cannot book their own rides.");
      return;
    }
    try {
      setBooking(true);
      const bookingRef = await requestBooking(ride.id!, ride.driverId, user.uid, 1);
      const chatId = `${ride.id}_${bookingRef.id}`;
      await ensureChat(chatId, ride.id!, bookingRef.id, [ride.driverId, user.uid]);
      showMessage("Requested", "Seat request sent to driver.");
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
    if (!ride.id) return;

    const confirmed = await confirmAction({
      title: "Delete ride?",
      message: "This will remove your ride from Find Ride. Riders can no longer book it.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      setDeleting(true);
      await updateRideStatus(ride.id, "cancelled");
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
          title="Manage your ride"
          subtitle="Open chat with riders or delete this listing."
        />
        <PrimaryButton label="OPEN CHAT" onPress={openChat} />
        <View style={styles.gap} />
        <OutlineButton label="DELETE RIDE" onPress={handleDelete} danger disabled={deleting} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <SectionHeader
        title="Ready to ride?"
        subtitle="Request a seat and chat with the driver to confirm pickup details."
      />
      <PrimaryButton label="REQUEST SEAT" onPress={handleBook} loading={booking} />
      <View style={styles.gap} />
      <OutlineButton label="OPEN CHAT" onPress={openChat} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  gap: { height: 10 },
});
