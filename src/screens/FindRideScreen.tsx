import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { Ride } from "../types/models";
import { subscribeOpenRides } from "../services/rides";
import { SearchField } from "../components/ui/SearchField";
import { EmptyState } from "../components/ui/EmptyState";
import { RideListCard } from "../components/rides/RideListCard";
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
      <Text style={styles.subtitle}>Search by destination or browse all open trips.</Text>
      <SearchField
        placeholder="Search destination (e.g. SM North)"
        value={filter}
        onChangeText={setFilter}
      />

      {rides.length === 0 ? (
        <EmptyState
          emoji="🛣️"
          title="No rides yet"
          message="No open rides match your search. Be the first to post a ride as a driver!"
        />
      ) : (
        rides.map((item) => (
          <RideListCard
            key={item.id}
            ride={item}
            onPress={() => navigation.navigate("RideDetails", { ride: item })}
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 14, lineHeight: 19 },
});
