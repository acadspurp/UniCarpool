import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { TextField } from "../components/ui/TextField";
import { DatePickerField } from "../components/ui/DatePickerField";
import { TimePickerField } from "../components/ui/TimePickerField";
import { StepperField } from "../components/ui/StepperField";
import { PerPersonPriceField } from "../components/ui/PerPersonPriceField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { OutlineButton } from "../components/ui/OutlineButton";
import { PrivacyConsent } from "../components/ui/PrivacyConsent";
import { useAuthStore } from "../store/authStore";
import { postRide } from "../services/rides";
import { createOrUpdateProfile, subscribeProfile } from "../services/profile";
import { showMessage } from "../utils/alert";
import { isVehicleComplete, toVehicleInfo } from "../utils/vehicle";
import type { CampusRole, Profile } from "../types/models";
import { colors } from "../theme/colors";

type PostRideValues = {
  origin: string;
  destination: string;
  pricePerPerson: string;
  notes: string;
};

type VehicleValues = {
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
};

type PendingTrip = PostRideValues & {
  departureDate: Date;
  departureTime: Date;
  availableSeats: number;
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

const VEHICLE_PRIVACY_LABEL =
  "I agree to share my vehicle details (make, model, color, and plate if provided) with verified campus riders who view or book this ride, so they can identify the vehicle safely.";

export function PostRideScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<"trip" | "vehicle">("trip");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingTrip, setPendingTrip] = useState<PendingTrip | null>(null);
  const [vehiclePrivacyAccepted, setVehiclePrivacyAccepted] = useState(false);
  const [vehiclePrivacyError, setVehiclePrivacyError] = useState<string | null>(null);

  const [departureDate, setDepartureDate] = useState(defaultDepartureDate);
  const [departureTime, setDepartureTime] = useState(defaultDepartureTime);
  const [availableSeats, setAvailableSeats] = useState(1);

  const tripForm = useForm<PostRideValues>({
    defaultValues: {
      origin: "",
      destination: "",
      pricePerPerson: "",
      notes: "",
    },
  });

  const vehicleForm = useForm<VehicleValues>({
    defaultValues: {
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
      vehiclePlate: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeProfile(user.uid, (data) => {
      setProfile(data);
      if (data?.vehicle) {
        vehicleForm.reset({
          vehicleMake: data.vehicle.make || "",
          vehicleModel: data.vehicle.model || "",
          vehicleColor: data.vehicle.color || "",
          vehiclePlate: data.vehicle.plate || "",
        });
      }
    });
    return () => unsub();
  }, [user, vehicleForm]);

  const onContinueToVehicle = (values: PostRideValues) => {
    if (!values.origin.trim() || !values.destination.trim()) {
      showMessage("Missing details", "Please enter origin and destination.");
      return;
    }
    if (!values.pricePerPerson.trim() || Number(values.pricePerPerson) <= 0) {
      showMessage("Missing amount", "Please enter how much each person should pay.");
      return;
    }
    setPendingTrip({
      ...values,
      departureDate,
      departureTime,
      availableSeats,
    });
    setVehiclePrivacyAccepted(false);
    setVehiclePrivacyError(null);
    setStep("vehicle");
  };

  const onPublishRide = async (vehicleValues: VehicleValues) => {
    if (!user || !pendingTrip) return;

    const vehicle = toVehicleInfo({
      make: vehicleValues.vehicleMake,
      model: vehicleValues.vehicleModel,
      color: vehicleValues.vehicleColor,
      plate: vehicleValues.vehiclePlate,
    });

    if (!isVehicleComplete(vehicle)) {
      showMessage("Vehicle required", "Please enter your vehicle make, model, and color.");
      return;
    }

    if (!vehiclePrivacyAccepted) {
      setVehiclePrivacyError("Please agree to share vehicle details with riders before publishing.");
      showMessage(
        "Consent required",
        "Please agree to the vehicle information notice before publishing your ride.",
      );
      return;
    }
    setVehiclePrivacyError(null);

    const campusRole: CampusRole = profile?.campusRole ?? "student";

    try {
      setLoading(true);
      await createOrUpdateProfile({
        uid: user.uid,
        email: user.email || "",
        fullName: profile?.fullName || user.displayName || "",
        campusRole,
        department: profile?.department || "",
        phone: profile?.phone || "",
        isVerifiedCampus: user.emailVerified,
        vehicle,
      });

      await postRide({
        driverId: user.uid,
        origin: { name: pendingTrip.origin.trim(), lat: 0, lng: 0 },
        destination: { name: pendingTrip.destination.trim(), lat: 0, lng: 0 },
        departureTime: mergeDeparture(pendingTrip.departureDate, pendingTrip.departureTime),
        availableSeats: pendingTrip.availableSeats,
        notes: pendingTrip.notes.trim(),
        status: "open",
        priceShareNote: `₱${pendingTrip.pricePerPerson.trim()} per person`,
        vehicle,
      });

      showMessage("Ride posted", "Your ride is now visible to riders with your vehicle details.");
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

  if (step === "vehicle") {
    return (
      <ScreenContainer>
        <Text style={styles.step}>Step 2 of 2</Text>
        <SectionHeader
          title="Vehicle details"
          subtitle="Required before your ride goes live. Riders will see this to identify your car safely."
        />
        <View style={styles.card}>
          <Controller
            control={vehicleForm.control}
            name="vehicleMake"
            render={({ field: { onChange, value } }) => (
              <TextField label="Make" placeholder="Toyota" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={vehicleForm.control}
            name="vehicleModel"
            render={({ field: { onChange, value } }) => (
              <TextField label="Model" placeholder="Vios" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={vehicleForm.control}
            name="vehicleColor"
            render={({ field: { onChange, value } }) => (
              <TextField label="Color" placeholder="White" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={vehicleForm.control}
            name="vehiclePlate"
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Plate number (optional)"
                placeholder="ABC 1234"
                value={value}
                onChangeText={onChange}
                autoCapitalize="characters"
              />
            )}
          />

          <PrivacyConsent
            checked={vehiclePrivacyAccepted}
            onToggle={() => {
              setVehiclePrivacyAccepted((v) => !v);
              setVehiclePrivacyError(null);
            }}
            label={VEHICLE_PRIVACY_LABEL}
            error={vehiclePrivacyError ?? undefined}
          />

          <PrimaryButton
            label="PUBLISH RIDE"
            onPress={vehicleForm.handleSubmit(onPublishRide)}
            loading={loading}
          />
          <View style={styles.backWrap}>
            <OutlineButton label="BACK TO TRIP DETAILS" onPress={() => setStep("trip")} />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.step}>Step 1 of 2</Text>
      <SectionHeader
        title="Post a ride"
        subtitle="Share your trip with fellow PUP commuters. Cost-sharing is arranged offline."
      />
      <View style={styles.card}>
        <Controller
          control={tripForm.control}
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
          control={tripForm.control}
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
          control={tripForm.control}
          name="pricePerPerson"
          render={({ field: { onChange, value } }) => (
            <PerPersonPriceField value={value} onChange={onChange} />
          )}
        />
        <Controller
          control={tripForm.control}
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
        <PrimaryButton
          label="CONTINUE"
          onPress={tripForm.handleSubmit(onContinueToVehicle)}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  step: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backWrap: { marginTop: 10 },
});
