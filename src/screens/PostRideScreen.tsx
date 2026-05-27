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
import {
  formatVehicle,
  isVehicleComplete,
  profileHasCompleteVehicle,
  toVehicleInfo,
} from "../utils/vehicle";
import type { CampusRole, Profile, VehicleInfo } from "../types/models";
import { colors } from "../theme/colors";

type PostRideValues = {
  origin: string;
  destination: string;
  pricePerPerson: string;
  notes: string;
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
  "I agree to share my vehicle details (make, model, color, and plate number) with verified campus riders who view or book this ride, so they can identify the vehicle safely.";

export function PostRideScreen({ navigation }: any) {
  const { user, refreshUser } = useAuthStore();
  const [step, setStep] = useState<"trip" | "vehicle">("trip");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingTrip, setPendingTrip] = useState<PendingTrip | null>(null);
  const [vehiclePrivacyAccepted, setVehiclePrivacyAccepted] = useState(false);
  const [vehiclePrivacyError, setVehiclePrivacyError] = useState<string | null>(null);

  const [departureDate, setDepartureDate] = useState(defaultDepartureDate);
  const [departureTime, setDepartureTime] = useState(defaultDepartureTime);
  const [availableSeats, setAvailableSeats] = useState(1);

  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");

  const tripForm = useForm<PostRideValues>({
    defaultValues: {
      origin: "",
      destination: "",
      pricePerPerson: "",
      notes: "",
    },
  });

  const hasSavedVehicle = profileHasCompleteVehicle(profile);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeProfile(user.uid, setProfile);
    return () => unsub();
  }, [user]);

  const loadVehicleFieldsFromProfile = () => {
    const v = profile?.vehicle;
    setVehicleMake(v?.make ?? "");
    setVehicleModel(v?.model ?? "");
    setVehicleColor(v?.color ?? "");
    setVehiclePlate(v?.plate ?? "");
  };

  const publishRide = async (vehicle: VehicleInfo, trip: PendingTrip) => {
    if (!user) return;

    if (!vehiclePrivacyAccepted) {
      setVehiclePrivacyError("Please agree to share vehicle details with riders before publishing.");
      showMessage(
        "Consent required",
        "Please agree to the vehicle information notice before publishing your ride.",
      );
      return;
    }
    setVehiclePrivacyError(null);

    // Firestore security rules rely on auth token fields (e.g. `email_verified`).
    // Refresh right before writes so stale tokens don't cause permission-denied errors.
    try {
      await refreshUser();
    } catch {
      // If refresh fails, we'll still attempt to post and let Firestore return the real error.
    }

    if (!user.emailVerified) {
      showMessage(
        "Email verification required",
        "Please verify your email in your inbox before posting a ride.",
      );
      return;
    }

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
        origin: { name: trip.origin.trim().toUpperCase(), lat: 0, lng: 0 },
        destination: { name: trip.destination.trim().toUpperCase(), lat: 0, lng: 0 },
        departureTime: mergeDeparture(trip.departureDate, trip.departureTime),
        availableSeats: trip.availableSeats,
        notes: trip.notes.trim(),
        status: "open",
        priceShareNote: `₱${trip.pricePerPerson.trim()} per person`,
        vehicle,
      });

      showMessage("Ride posted", "Your ride is now visible to riders with your vehicle details.");
      navigation.goBack();
    } catch (error: unknown) {
      const code = typeof error === "object" && error && "code" in error ? (error as any).code : null;
      const isPermissionDenied = code === "permission-denied";

      if (isPermissionDenied) {
        try {
          const token = await user.getIdTokenResult(true);
          const emailVerifiedClaim = (token.claims as any)?.email_verified;
          const campusVerifiedClaim = (token.claims as any)?.campusVerified;
          showMessage(
            "Could not post ride (permissions)",
            `Auth: email=${user.email ?? "—"} | user.emailVerified=${String(
              user.emailVerified,
            )} | token.email_verified=${String(emailVerifiedClaim)} | token.campusVerified=${String(
              campusVerifiedClaim,
            )}`,
          );
          return;
        } catch {
          // Fall through to generic permission message below.
        }
      }

      showMessage(
        isPermissionDenied ? "Could not post ride (permissions)" : "Could not post ride",
        isPermissionDenied
          ? "Your account may not be verified to post rides. Make sure your email is verified and belongs to the campus domain."
          : error instanceof Error
            ? error.message
            : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onTripStepSubmit = (values: PostRideValues) => {
    if (!values.origin.trim() || !values.destination.trim()) {
      showMessage("Missing details", "Please enter origin and destination.");
      return;
    }
    if (!values.pricePerPerson.trim() || Number(values.pricePerPerson) <= 0) {
      showMessage("Missing amount", "Please enter how much each person should pay.");
      return;
    }

    const trip: PendingTrip = {
      ...values,
      departureDate,
      departureTime,
      availableSeats,
    };
    setPendingTrip(trip);

    if (hasSavedVehicle && profile?.vehicle) {
      void publishRide(profile.vehicle, trip);
      return;
    }

    setVehiclePrivacyAccepted(false);
    setVehiclePrivacyError(null);
    loadVehicleFieldsFromProfile();
    setStep("vehicle");
  };

  const onPublishFromVehicleStep = () => {
    if (!pendingTrip) return;

    const vehicle = toVehicleInfo({
      make: vehicleMake,
      model: vehicleModel,
      color: vehicleColor,
      plate: vehiclePlate,
    });

    if (!isVehicleComplete(vehicle)) {
      showMessage(
        "Vehicle required",
        "Please enter make, model, color, and plate number.",
      );
      return;
    }

    void publishRide(vehicle, pendingTrip);
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
          <TextField
            label="Make"
            placeholder="TOYOTA"
            value={vehicleMake}
            onChangeText={setVehicleMake}
            uppercase
          />
          <TextField
            label="Model"
            placeholder="VIOS"
            value={vehicleModel}
            onChangeText={setVehicleModel}
            uppercase
          />
          <TextField
            label="Color"
            placeholder="WHITE"
            value={vehicleColor}
            onChangeText={setVehicleColor}
            uppercase
          />
          <TextField
            label="Plate number"
            placeholder="ABC 1234"
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            uppercase
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

          <PrimaryButton label="PUBLISH RIDE" onPress={onPublishFromVehicleStep} loading={loading} />
          <View style={styles.backWrap}>
            <OutlineButton label="BACK TO TRIP DETAILS" onPress={() => setStep("trip")} />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.step}>{hasSavedVehicle ? "Ready to publish" : "Step 1 of 2"}</Text>
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
              placeholder="e.g. PUP MAIN CAMPUS"
              value={value}
              onChangeText={onChange}
              uppercase
            />
          )}
        />
        <Controller
          control={tripForm.control}
          name="destination"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Destination"
              placeholder="e.g. SM NORTH"
              value={value}
              onChangeText={onChange}
              uppercase
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

        {hasSavedVehicle && profile?.vehicle ? (
          <View style={styles.savedVehicleCard}>
            <Text style={styles.savedVehicleTitle}>Vehicle from your profile</Text>
            <Text style={styles.savedVehicleText}>{formatVehicle(profile.vehicle)}</Text>
            <Text style={styles.savedVehicleHint}>
              Step 2 is skipped because your vehicle is already on file.
            </Text>
          </View>
        ) : null}

        {hasSavedVehicle ? (
          <PrivacyConsent
            checked={vehiclePrivacyAccepted}
            onToggle={() => {
              setVehiclePrivacyAccepted((v) => !v);
              setVehiclePrivacyError(null);
            }}
            label={VEHICLE_PRIVACY_LABEL}
            error={vehiclePrivacyError ?? undefined}
          />
        ) : null}

        <PrimaryButton
          label={hasSavedVehicle ? "PUBLISH RIDE" : "CONTINUE"}
          onPress={tripForm.handleSubmit(onTripStepSubmit)}
          loading={loading}
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
  savedVehicleCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savedVehicleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: 6,
  },
  savedVehicleText: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 6 },
  savedVehicleHint: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  backWrap: { marginTop: 10 },
});
