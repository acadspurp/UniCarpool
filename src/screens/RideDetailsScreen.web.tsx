import { Alert, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { OutlineButton } from "../components/ui/OutlineButton";
import { useAuthStore } from "../store/authStore";
import { requestBooking } from "../services/bookings";
import { ensureChat } from "../services/chat";
import { colors } from "../theme/colors";

export function RideDetailsScreen({ route, navigation }: any) {
  const { ride } = route.params;
  const { user } = useAuthStore();

  const handleBook = async () => {
    if (!user) return;
    if (user.uid === ride.driverId) {
      Alert.alert("Not allowed", "Drivers cannot book their own rides.");
      return;
    }
    try {
      const bookingRef = await requestBooking(ride.id, ride.driverId, user.uid, 1);
      const chatId = `${ride.id}_${bookingRef.id}`;
      await ensureChat(chatId, ride.id, bookingRef.id, [ride.driverId, user.uid]);
      Alert.alert("Requested", "Seat request sent to driver.");
    } catch (error: any) {
      Alert.alert("Booking failed", error.message);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.routeCard}>
        <Text style={styles.routeLabel}>Route</Text>
        <Text style={styles.route}>
          {ride.origin.name} → {ride.destination.name}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Info label="Departure" value={String(ride.departureTime)} />
        <Info label="Seats left" value={String(ride.availableSeats)} />
      </View>

      {ride.notes ? (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Driver notes</Text>
          <Text style={styles.notesText}>{ride.notes}</Text>
        </View>
      ) : null}

      <SectionHeader
        title="Ready to ride?"
        subtitle="Request a seat and chat with the driver to confirm pickup details."
      />

      <PrimaryButton label="REQUEST SEAT" onPress={handleBook} />
      <View style={styles.gap} />
      <OutlineButton
        label="OPEN CHAT"
        onPress={() => navigation.navigate("Chat", { chatId: `${ride.id}_direct` })}
      />
    </ScreenContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  routeCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  routeLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 },
  route: { color: colors.textOnPrimary, fontSize: 20, fontWeight: "800" },
  infoRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: "700", color: colors.text },
  notesCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  notesTitle: { fontWeight: "700", color: colors.primaryDark, marginBottom: 4 },
  notesText: { color: colors.textMuted, lineHeight: 20 },
  gap: { height: 10 },
});
