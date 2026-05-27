import { Alert, Button, Text, TextInput } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuthStore } from "../store/authStore";
import { postRide } from "../services/rides";

type PostRideValues = {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: string;
  notes: string;
};

export function PostRideScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { control, handleSubmit } = useForm<PostRideValues>({
    defaultValues: {
      origin: "",
      destination: "",
      departureTime: "",
      availableSeats: "1",
      notes: "",
    },
  });

  const onSubmit = async (values: PostRideValues) => {
    if (!user) return;
    await postRide({
      driverId: user.uid,
      origin: { name: values.origin, lat: 0, lng: 0 },
      destination: { name: values.destination, lat: 0, lng: 0 },
      departureTime: values.departureTime,
      availableSeats: Number(values.availableSeats),
      notes: values.notes,
      status: "open",
      priceShareNote: "Cost sharing only; no in-app payments.",
    });
    Alert.alert("Ride posted");
    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <Text>Post a ride offer</Text>
      {(["origin", "destination", "departureTime", "availableSeats", "notes"] as const).map(
        (field) => (
          <Controller
            key={field}
            control={control}
            name={field}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#cbd5e1",
                  borderRadius: 8,
                  padding: 10,
                  marginVertical: 6,
                  backgroundColor: "#fff",
                }}
                placeholder={field}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        ),
      )}
      <Button title="Publish ride" onPress={handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}
