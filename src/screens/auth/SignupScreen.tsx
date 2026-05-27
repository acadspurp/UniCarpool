import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CAMPUS_DOMAIN, signUp } from "../../services/auth";
import { AuthSplitLayout } from "../../components/auth/AuthSplitLayout";
import { TextField } from "../../components/ui/TextField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { colors } from "../../theme/colors";

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().endsWith(CAMPUS_DOMAIN),
  password: z.string().min(6),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupValues) => {
    try {
      setLoading(true);
      await signUp(values.email, values.password, values.fullName);
      Alert.alert("Account created", "Check your campus email for verification.");
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert("Signup failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      variant="signup"
      title="Create Account"
      subtitle="Join the PUP carpool community"
      promoTitle="Welcome Back!"
      promoText="Already have an account? Sign in to continue posting rides, booking seats, and messaging drivers or riders."
      switchLabel="SIGN IN"
      onSwitch={() => navigation.navigate("Login")}
    >
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <TextField placeholder="Full name" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextField
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={`name${CAMPUS_DOMAIN}`}
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
      <PrimaryButton label="SIGN UP" onPress={handleSubmit(onSubmit)} loading={loading} />
    </AuthSplitLayout>
  );
}

const styles = StyleSheet.create({
  backLink: { marginBottom: 16 },
  backText: { color: colors.textMuted, fontSize: 13 },
});
