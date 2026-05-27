import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "../../services/auth";
import { AuthSplitLayout } from "../../components/auth/AuthSplitLayout";
import { TextField } from "../../components/ui/TextField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { colors } from "../../theme/colors";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      setLoading(true);
      await signIn(values.email, values.password);
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      variant="login"
      title="Sign In"
      subtitle="Welcome back to UniCarpool"
      promoTitle="Hello, Friend!"
      promoText="Register with your PUP institutional email to post rides, find carpools, and chat with your campus community."
      switchLabel="SIGN UP"
      onSwitch={() => navigation.navigate("Signup")}
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextField
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextField secureTextEntry placeholder="Password" value={value} onChangeText={onChange} />
        )}
      />
      <Pressable onPress={() => navigation.navigate("Welcome")} style={styles.backLink}>
        <Text style={styles.backText}>← Back to overview</Text>
      </Pressable>
      <PrimaryButton label="SIGN IN" onPress={handleSubmit(onSubmit)} loading={loading} />
    </AuthSplitLayout>
  );
}

const styles = StyleSheet.create({
  backLink: { marginBottom: 16 },
  backText: { color: colors.textMuted, fontSize: 13 },
});
