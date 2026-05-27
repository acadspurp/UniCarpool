import { Alert, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { OutlineButton } from "../components/ui/OutlineButton";
import { useAuthStore } from "../store/authStore";
import { requestBooking } from "../services/bookings";
import { ensureChat } from "../services/chat";
import { formatDepartureLabel } from "../utils/date";
import { formatVehicle } from "../utils/vehicle";
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
      <View style={styles.mapWrap}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: ride.origin.lat || 14.5995,
            longitude: ride.origin.lng || 120.9842,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
        >
          <Marker coordinate={{ latitude: ride.origin.lat || 14.5995, longitude: ride.origin.lng || 120.9842 }} />
          <Marker
            pinColor="green"
            coordinate={{
              latitude: ride.destination.lat || 14.6091,
              longitude: ride.destination.lng || 121.0223,
            }}
          />
        </MapView>
      </View>

      <Text style={styles.route}>
        {ride.origin.name} → {ride.destination.name}
      </Text>
      <Text style={styles.meta}>
        {formatDepartureLabel(ride.departureTime)} · {ride.availableSeats} seat
        {ride.availableSeats === 1 ? "" : "s"} left
      </Text>
      {ride.priceShareNote ? (
        <Text style={styles.price}>{ride.priceShareNote}</Text>
      ) : null}
      {ride.vehicle ? (
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleTitle}>Vehicle</Text>
          <Text style={styles.vehicleText}>{formatVehicle(ride.vehicle)}</Text>
        </View>
      ) : null}
      {ride.notes ? <Text style={styles.notes}>{ride.notes}</Text> : null}

      <SectionHeader title="Book this ride" subtitle="Request a seat and coordinate via chat." />
      <PrimaryButton label="REQUEST SEAT" onPress={handleBook} />
      <View style={styles.gap} />
      <OutlineButton
        label="OPEN CHAT"
        onPress={() => navigation.navigate("Chat", { chatId: `${ride.id}_direct` })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mapWrap: { height: 200, borderRadius: 16, overflow: "hidden", marginBottom: 14 },
  route: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  price: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 8 },
  vehicleCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  vehicleTitle: { fontSize: 12, fontWeight: "700", color: colors.primaryDark, marginBottom: 4 },
  vehicleText: { fontSize: 14, fontWeight: "600", color: colors.text },
  notes: { fontSize: 13, color: colors.textMuted, marginBottom: 12, lineHeight: 18 },
  gap: { height: 10 },
});
