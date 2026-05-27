import { Button, Text } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";

export function HomeScreen({ navigation }: any) {
  return (
    <ScreenContainer>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Welcome to UniCarpool
      </Text>
      <Text style={{ marginBottom: 12 }}>
        Choose mode: Driver (post ride) or Rider (find ride).
      </Text>
      <Button title="Driver: Post Ride" onPress={() => navigation.navigate("PostRide")} />
      <Button title="Rider: Find Ride" onPress={() => navigation.navigate("FindRide")} />
    </ScreenContainer>
  );
}
