import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { RideDetailsActions } from "../components/rides/RideDetailsActions";
import { formatDepartureLabel } from "../utils/date";
import { formatVehicle } from "../utils/vehicle";
import { colors } from "../theme/colors";

export function RideDetailsScreen({ route, navigation }: any) {
  const { ride } = route.params;

  return (
    <ScreenContainer>
      <View style={styles.routeCard}>
        <Text style={styles.routeLabel}>Route</Text>
        <Text style={styles.route}>
          {ride.origin.name} → {ride.destination.name}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Info label="Departure" value={formatDepartureLabel(ride.departureTime)} />
        <Info label="Seats left" value={String(ride.availableSeats)} />
      </View>

      {ride.priceShareNote ? (
        <View style={styles.infoCardWide}>
          <Text style={styles.infoLabel}>Share per person</Text>
          <Text style={styles.infoValue}>{ride.priceShareNote}</Text>
        </View>
      ) : null}

      {ride.vehicle ? (
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleTitle}>Vehicle</Text>
          <Text style={styles.vehicleText}>{formatVehicle(ride.vehicle)}</Text>
        </View>
      ) : null}

      {ride.notes ? (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{ride.notes}</Text>
        </View>
      ) : null}

      <RideDetailsActions ride={ride} navigation={navigation} />
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
  infoCardWide: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleTitle: { fontSize: 14, fontWeight: "700", color: colors.primaryDark, marginBottom: 6 },
  vehicleText: { fontSize: 15, fontWeight: "700", color: colors.text },
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
});
