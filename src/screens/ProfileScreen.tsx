import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "../components/ui/AppIcon";
import { Controller, useForm } from "react-hook-form";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/ui/TextField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { OutlineButton } from "../components/ui/OutlineButton";
import { useAuthStore } from "../store/authStore";
import { createOrUpdateProfile } from "../services/profile";
import { logout, CAMPUS_DOMAIN } from "../services/auth";
import { colors } from "../theme/colors";

type ProfileValues = {
  fullName: string;
  department: string;
  campusRole: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
};

export function ProfileScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const { control, handleSubmit } = useForm<ProfileValues>({
    defaultValues: {
      fullName: user?.displayName || "",
      department: "",
      campusRole: "student",
      phone: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
      vehiclePlate: "",
    },
  });

  const onSave = async (values: ProfileValues) => {
    if (!user) return;
    const hasVehicle =
      values.vehicleMake || values.vehicleModel || values.vehicleColor || values.vehiclePlate;

    try {
      setLoading(true);
      await createOrUpdateProfile({
        uid: user.uid,
        email: user.email || "",
        fullName: values.fullName,
        department: values.department,
        campusRole: values.campusRole as "student" | "faculty" | "staff",
        phone: values.phone,
        isVerifiedCampus: user.emailVerified,
        ...(hasVehicle
          ? {
              vehicle: {
                make: values.vehicleMake,
                model: values.vehicleModel,
                color: values.vehicleColor,
                plate: values.vehiclePlate,
              },
            }
          : {}),
      });
      Alert.alert("Profile updated", "Your information has been saved.");
    } catch (error: unknown) {
      Alert.alert("Update failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    Alert.alert("Log out?", "You will need to sign in again to use UniCarpool.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.headerCard}>
        <Text style={styles.avatar}>🎓</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.domain}>Verified campus · {CAMPUS_DOMAIN}</Text>
      </View>

      <Text style={styles.intro}>
        This information helps connect you with fellow campus members.
      </Text>

      <View style={styles.card}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <TextField label="Full name" placeholder="Full name" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="department"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Department"
              placeholder="e.g. BS Information Technology"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="campusRole"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Campus role"
              placeholder="student | faculty | staff"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Phone"
              placeholder="09XX XXX XXXX"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
            />
          )}
        />

        <Pressable style={styles.vehicleToggle} onPress={() => setVehicleOpen((v) => !v)}>
          <Text style={styles.vehicleToggleText}>Vehicle details (drivers)</Text>
          <AppIcon
            name={vehicleOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.primary}
          />
        </Pressable>

        {vehicleOpen ? (
          <View style={styles.vehicleSection}>
            <Text style={styles.vehicleHint}>Optional — shown when you post rides as a driver.</Text>
            <Controller
              control={control}
              name="vehicleMake"
              render={({ field: { onChange, value } }) => (
                <TextField label="Make" placeholder="Toyota" value={value} onChangeText={onChange} />
              )}
            />
            <Controller
              control={control}
              name="vehicleModel"
              render={({ field: { onChange, value } }) => (
                <TextField label="Model" placeholder="Vios" value={value} onChangeText={onChange} />
              )}
            />
            <Controller
              control={control}
              name="vehicleColor"
              render={({ field: { onChange, value } }) => (
                <TextField label="Color" placeholder="White" value={value} onChangeText={onChange} />
              )}
            />
            <Controller
              control={control}
              name="vehiclePlate"
              render={({ field: { onChange, value } }) => (
                <TextField label="Plate (optional)" placeholder="ABC 1234" value={value} onChangeText={onChange} />
              )}
            />
          </View>
        ) : null}

        <PrimaryButton label="UPDATE PROFILE" onPress={handleSubmit(onSave)} loading={loading} />
        <Pressable onPress={onLogout} style={styles.logoutLink}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: { fontSize: 36, marginBottom: 6 },
  email: { color: colors.textOnPrimary, fontWeight: "700", fontSize: 14 },
  domain: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
  intro: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  vehicleToggleText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  vehicleSection: { marginBottom: 8 },
  vehicleHint: { fontSize: 12, color: colors.textMuted, marginBottom: 10, lineHeight: 17 },
  logoutLink: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  logoutText: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
});
