import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { TextField } from "../components/ui/TextField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useAuthStore } from "../store/authStore";
import { postRide } from "../services/rides";
import { colors } from "../theme/colors";

type PostRideValues = {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: string;
  notes: string;
};

const FIELDS: { key: keyof PostRideValues; label: string; placeholder: string }[] = [
  { key: "origin", label: "Origin", placeholder: "e.g. PUP Main Campus" },
  { key: "destination", label: "Destination", placeholder: "e.g. SM North" },
  { key: "departureTime", label: "Departure", placeholder: "e.g. 2026-05-28 17:30" },
  { key: "availableSeats", label: "Available seats", placeholder: "1" },
  { key: "notes", label: "Notes (optional)", placeholder: "Pickup point, cost-sharing note..." },
];

export function PostRideScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
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
    try {
      setLoading(true);
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
      Alert.alert("Ride posted", "Your ride is now visible to riders.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Could not post ride", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <SectionHeader
        title="Post a ride"
        subtitle="Share your trip with fellow PUP commuters. Cost-sharing is arranged offline."
      />
      <View style={styles.card}>
        {FIELDS.map(({ key, label, placeholder }) => (
          <Controller
            key={key}
            control={control}
            name={key}
            render={({ field: { onChange, value } }) => (
              <TextField label={label} placeholder={placeholder} value={value} onChangeText={onChange} />
            )}
          />
        ))}
        <PrimaryButton label="PUBLISH RIDE" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
