import { StyleSheet, Text, View } from "react-native";
import { Ride } from "../../types/models";
import { formatDepartureLabel } from "../../utils/date";
import { formatVehicle } from "../../utils/vehicle";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../ui/PrimaryButton";

type Props = {
  ride: Ride;
  onPress: () => void;
  actionLabel?: string;
};

export function RideListCard({ ride, onPress, actionLabel = "Request seat" }: Props) {
  const seatsLeft = Math.max(0, ride.availableSeats);
  const seatsLabel =
    seatsLeft === 0
      ? "Full"
      : seatsLeft === 1
        ? "1 seat left"
        : `${seatsLeft} seats left`;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🚗</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.driver}>Campus driver</Text>
          <Text style={styles.time}>{formatDepartureLabel(ride.departureTime)}</Text>
        </View>
        <View style={styles.seatsBadge}>
          <Text style={styles.seatsText}>{seatsLabel}</Text>
        </View>
      </View>

      <Text style={styles.route}>
        {ride.origin.name} → {ride.destination.name}
      </Text>
      <Text style={styles.pickup}>Pickup: {ride.origin.name}</Text>
      {ride.priceShareNote ? (
        <Text style={styles.price}>{ride.priceShareNote}</Text>
      ) : null}
      {ride.vehicle ? (
        <Text style={styles.vehicle}>Vehicle: {formatVehicle(ride.vehicle)}</Text>
      ) : null}

      <PrimaryButton
        label={actionLabel.toUpperCase()}
        onPress={onPress}
        disabled={seatsLeft < 1 || ride.status !== "open"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontSize: 20 },
  headerText: { flex: 1 },
  driver: { fontSize: 15, fontWeight: "700", color: colors.text },
  time: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  seatsBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  seatsText: { fontSize: 11, fontWeight: "700", color: colors.primaryDark },
  route: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  pickup: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  price: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 4 },
  vehicle: { fontSize: 13, color: colors.textMuted, marginBottom: 12, lineHeight: 18 },
});
