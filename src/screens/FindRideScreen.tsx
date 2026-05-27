import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { Ride } from "../types/models";
import { subscribeOpenRides } from "../services/rides";
import { TextField } from "../components/ui/TextField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { colors } from "../theme/colors";

export function FindRideScreen({ navigation }: any) {
  const [filter, setFilter] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    const unsub = subscribeOpenRides(setRides, filter || undefined);
    return () => unsub();
  }, [filter]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Find a ride</Text>
      <TextField
        placeholder="Filter by destination"
        value={filter}
        onChangeText={setFilter}
      />
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id || Math.random().toString()}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No open rides yet. Check back soon or post as a driver.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.route}>
              {item.origin.name} {"→"} {item.destination.name}
            </Text>
            <Text style={styles.meta}>Seats: {item.availableSeats}</Text>
            <PrimaryButton
              label="VIEW DETAILS"
              onPress={() => navigation.navigate("RideDetails", { ride: item })}
            />
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 12 },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  route: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 24, lineHeight: 20 },
});
