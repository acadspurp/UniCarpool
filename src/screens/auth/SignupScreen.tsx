import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScreenContainer } from "../../components/ScreenContainer";
import { CAMPUS_DOMAIN, signUp } from "../../services/auth";

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().endsWith(CAMPUS_DOMAIN),
  password: z.string().min(6),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupScreen() {
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
    } catch (error: any) {
      Alert.alert("Signup failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Only {CAMPUS_DOMAIN} emails are allowed.</Text>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Full name" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
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
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <Button title={loading ? "Creating..." : "Sign up"} onPress={handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { marginBottom: 12, color: "#334155" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});
