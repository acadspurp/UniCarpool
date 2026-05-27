import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "../components/ui/AppIcon";
import { Controller, useForm } from "react-hook-form";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/ui/TextField";
import { ReadOnlyField } from "../components/ui/ReadOnlyField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useAuthStore } from "../store/authStore";
import { createOrUpdateProfile, subscribeProfile } from "../services/profile";
import { logout, CAMPUS_DOMAIN } from "../services/auth";
import { formatCampusRole } from "../constants/campusRoles";
import { confirmAction, showMessage } from "../utils/alert";
import { isVehicleComplete, toVehicleInfo } from "../utils/vehicle";
import type { CampusRole, Profile } from "../types/models";
import { colors } from "../theme/colors";

type ProfileValues = {
  department: string;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const { control, handleSubmit, reset } = useForm<ProfileValues>({
    defaultValues: {
      department: "",
      phone: "",
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
      if (data) {
        reset({
          department: data.department || "",
          phone: data.phone || "",
          vehicleMake: data.vehicle?.make || "",
          vehicleModel: data.vehicle?.model || "",
          vehicleColor: data.vehicle?.color || "",
          vehiclePlate: data.vehicle?.plate || "",
        });
      }
    });
    return () => unsub();
  }, [user, reset]);

  const campusRole: CampusRole = profile?.campusRole ?? "student";
  const fullName = profile?.fullName?.trim() || user?.displayName?.trim() || "";

  const onSave = async (values: ProfileValues) => {
    if (!user) return;
    const vehicleDraft = toVehicleInfo({
      make: values.vehicleMake,
      model: values.vehicleModel,
      color: values.vehicleColor,
      plate: values.vehiclePlate,
    });
    const hasAnyVehicleField = Boolean(
      values.vehicleMake.trim() ||
        values.vehicleModel.trim() ||
        values.vehicleColor.trim() ||
        values.vehiclePlate.trim(),
    );

    if (hasAnyVehicleField && !isVehicleComplete(vehicleDraft)) {
      showMessage(
        "Incomplete vehicle",
        "Please enter make, model, color, and plate number, or leave all vehicle fields empty.",
      );
      return;
    }

    try {
      setLoading(true);
      await createOrUpdateProfile({
        uid: user.uid,
        email: user.email || "",
        fullName,
        department: values.department,
        campusRole,
        phone: values.phone,
        isVerifiedCampus: user.emailVerified,
        ...(hasAnyVehicleField ? { vehicle: vehicleDraft } : {}),
      });
      showMessage("Profile updated", "Your information has been saved.");
    } catch (error: unknown) {
      showMessage("Update failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    const confirmed = await confirmAction({
      title: "Log out?",
      message: "You will need to sign in again to use UniCarpool.",
      confirmLabel: "Log Out",
      destructive: true,
    });
    if (confirmed) await logout();
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
        <ReadOnlyField
          label="Full name"
          value={fullName || "—"}
          hint="Set when you signed up and cannot be changed here."
        />
        <ReadOnlyField
          label="Campus role"
          value={formatCampusRole(campusRole)}
          hint="Set when you signed up and cannot be changed here."
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
            <Text style={styles.vehicleHint}>
              Optional — if you add a vehicle, include make, model, color, and plate. Used when you post rides.
            </Text>
            <Controller
              control={control}
              name="vehicleMake"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Make"
                  placeholder="TOYOTA"
                  value={value}
                  onChangeText={onChange}
                  uppercase
                />
              )}
            />
            <Controller
              control={control}
              name="vehicleModel"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Model"
                  placeholder="VIOS"
                  value={value}
                  onChangeText={onChange}
                  uppercase
                />
              )}
            />
            <Controller
              control={control}
              name="vehicleColor"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Color"
                  placeholder="WHITE"
                  value={value}
                  onChangeText={onChange}
                  uppercase
                />
              )}
            />
            <Controller
              control={control}
              name="vehiclePlate"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Plate number"
                  placeholder="ABC 1234"
                  value={value}
                  onChangeText={onChange}
                  uppercase
                />
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
