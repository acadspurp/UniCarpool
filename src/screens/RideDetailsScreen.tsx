import { Alert, Button, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuthStore } from "../store/authStore";
import { requestBooking } from "../services/bookings";
import { ensureChat } from "../services/chat";

export function RideDetailsScreen({ route, navigation }: any) {
  const { ride } = route.params;
  const { user } = useAuthStore();

  const handleBook = async () => {
    if (!user) return;
    if (user.uid === ride.driverId) {
      Alert.alert("Not allowed", "Drivers cannot book their own rides.");
      return;
    }
    const bookingRef = await requestBooking(ride.id, ride.driverId, user.uid, 1);
    const chatId = `${ride.id}_${bookingRef.id}`;
    await ensureChat(chatId, ride.id, bookingRef.id, [ride.driverId, user.uid]);
    Alert.alert("Requested", "Seat request sent to driver.");
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 }}>
        {ride.origin.name} {"->"} {ride.destination.name}
      </Text>
      <Text>Departure: {ride.departureTime}</Text>
      <Text>Seats left: {ride.availableSeats}</Text>
      <View style={{ height: 220, marginVertical: 14 }}>
        <MapView
          style={{ flex: 1 }}
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
      <Button title="Request seat" onPress={handleBook} />
      <Button title="Open chat" onPress={() => navigation.navigate("Chat", { chatId: `${ride.id}_direct` })} />
    </ScreenContainer>
  );
}
