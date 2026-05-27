import { Text } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";

export function MyRidesScreen() {
  return (
    <ScreenContainer>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>My Rides</Text>
      <Text>Track posted rides, bookings, and ride history here.</Text>
    </ScreenContainer>
  );
}
