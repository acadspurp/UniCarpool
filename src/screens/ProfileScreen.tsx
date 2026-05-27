import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
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
};

export function ProfileScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<ProfileValues>({
    defaultValues: {
      fullName: user?.displayName || "",
      department: "",
      campusRole: "student",
      phone: "",
    },
  });

  const onSave = async (values: ProfileValues) => {
    if (!user) return;
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
      });
      Alert.alert("Saved", "Profile updated. Sign out and back in if rides are blocked.");
    } catch (error: any) {
      Alert.alert("Save failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.headerCard}>
        <Text style={styles.avatar}>🎓</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.domain}>Campus email {CAMPUS_DOMAIN}</Text>
      </View>

      <SectionHeader title="Your profile" subtitle="Required for campus verification and ride matching." />

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
            <TextField label="Department" placeholder="e.g. BS Information Technology" value={value} onChangeText={onChange} />
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
            <TextField label="Phone" placeholder="09XX XXX XXXX" value={value} onChangeText={onChange} keyboardType="phone-pad" />
          )}
        />
        <PrimaryButton label="SAVE PROFILE" onPress={handleSubmit(onSave)} loading={loading} />
        <View style={styles.gap} />
        <OutlineButton label="LOGOUT" onPress={logout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: { fontSize: 40, marginBottom: 8 },
  email: { color: colors.textOnPrimary, fontWeight: "700", fontSize: 14 },
  domain: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gap: { height: 12 },
});
