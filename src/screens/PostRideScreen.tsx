import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { TextField } from "../components/ui/TextField";
import { DatePickerField } from "../components/ui/DatePickerField";
import { TimePickerField } from "../components/ui/TimePickerField";
import { StepperField } from "../components/ui/StepperField";
import { PerPersonPriceField } from "../components/ui/PerPersonPriceField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useAuthStore } from "../store/authStore";
import { postRide } from "../services/rides";
import { showMessage } from "../utils/alert";
import { colors } from "../theme/colors";

type PostRideValues = {
  origin: string;
  destination: string;
  pricePerPerson: string;
  notes: string;
};

function defaultDepartureDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function defaultDepartureTime() {
  const d = new Date();
  d.setHours(17, 30, 0, 0);
  return d;
}

function mergeDeparture(date: Date, time: Date) {
  const merged = new Date(date);
  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return merged.toISOString();
}

export function PostRideScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [departureDate, setDepartureDate] = useState(defaultDepartureDate);
  const [departureTime, setDepartureTime] = useState(defaultDepartureTime);
  const [availableSeats, setAvailableSeats] = useState(1);
  const { control, handleSubmit } = useForm<PostRideValues>({
    defaultValues: {
      origin: "",
      destination: "",
      pricePerPerson: "",
      notes: "",
    },
  });

  const onSubmit = async (values: PostRideValues) => {
    if (!user) return;
    if (!values.origin.trim() || !values.destination.trim()) {
      showMessage("Missing details", "Please enter origin and destination.");
      return;
    }
    if (!values.pricePerPerson.trim() || Number(values.pricePerPerson) <= 0) {
      showMessage("Missing amount", "Please enter how much each person should pay.");
      return;
    }
    try {
      setLoading(true);
      await postRide({
        driverId: user.uid,
        origin: { name: values.origin.trim(), lat: 0, lng: 0 },
        destination: { name: values.destination.trim(), lat: 0, lng: 0 },
        departureTime: mergeDeparture(departureDate, departureTime),
        availableSeats,
        notes: values.notes.trim(),
        status: "open",
        priceShareNote: `₱${values.pricePerPerson.trim()} per person`,
      });
      showMessage("Ride posted", "Your ride is now visible to riders.");
      navigation.goBack();
    } catch (error: unknown) {
      showMessage(
        "Could not post ride",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const today = defaultDepartureDate();

  return (
    <ScreenContainer>
      <SectionHeader
        title="Post a ride"
        subtitle="Share your trip with fellow PUP commuters. Cost-sharing is arranged offline."
      />
      <View style={styles.card}>
        <Controller
          control={control}
          name="origin"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Origin"
              placeholder="e.g. PUP Main Campus"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="destination"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Destination"
              placeholder="e.g. SM North"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <DatePickerField
          label="Departure date"
          value={departureDate}
          onChange={setDepartureDate}
          minimumDate={today}
        />
        <TimePickerField label="Departure time" value={departureTime} onChange={setDepartureTime} />
        <StepperField
          label="Available seats"
          value={availableSeats}
          onChange={setAvailableSeats}
          min={1}
          max={8}
        />
        <Controller
          control={control}
          name="pricePerPerson"
          render={({ field: { onChange, value } }) => (
            <PerPersonPriceField value={value} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Notes (optional)"
              placeholder="Pickup point, cost-sharing note..."
              value={value}
              onChangeText={onChange}
            />
          )}
        />
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
