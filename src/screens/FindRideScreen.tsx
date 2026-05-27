import { useEffect, useState } from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { Ride } from "../types/models";
import { subscribeOpenRides } from "../services/rides";

export function FindRideScreen({ navigation }: any) {
  const [filter, setFilter] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    const unsub = subscribeOpenRides(setRides, filter || undefined);
    return () => unsub();
  }, [filter]);

  return (
    <ScreenContainer>
      <TextInput
        placeholder="Filter by destination"
        value={filter}
        onChangeText={setFilter}
        style={{
          borderWidth: 1,
          borderColor: "#cbd5e1",
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
          backgroundColor: "#fff",
        }}
      />
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 8 }}>
            <Text>{item.origin.name} {"->"} {item.destination.name}</Text>
            <Text>Seats: {item.availableSeats}</Text>
            <Button title="View details" onPress={() => navigation.navigate("RideDetails", { ride: item })} />
          </View>
        )}
      />
    </ScreenContainer>
  );
}
