import { Alert, Button, Text, TextInput } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuthStore } from "../store/authStore";
import { createOrUpdateProfile } from "../services/profile";
import { logout } from "../services/auth";

type ProfileValues = {
  fullName: string;
  department: string;
  campusRole: "student" | "faculty" | "staff";
  phone: string;
};

export function ProfileScreen() {
  const { user } = useAuthStore();
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
    await createOrUpdateProfile({
      uid: user.uid,
      email: user.email || "",
      ...values,
      isVerifiedCampus: user.emailVerified,
    });
    Alert.alert("Saved", "Profile updated.");
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>Profile</Text>
      {(["fullName", "department", "campusRole", "phone"] as const).map((field) => (
        <Controller
          key={field}
          control={control}
          name={field}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange as any}
              placeholder={field}
              style={{
                borderWidth: 1,
                borderColor: "#cbd5e1",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                backgroundColor: "#fff",
              }}
            />
          )}
        />
      ))}
      <Button title="Save profile" onPress={handleSubmit(onSave)} />
      <Button title="Logout" onPress={logout} />
    </ScreenContainer>
  );
}
