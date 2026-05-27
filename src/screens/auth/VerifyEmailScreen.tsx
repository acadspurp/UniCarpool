import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../services/firebase";
import { logout } from "../../services/auth";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { OutlineButton } from "../../components/ui/OutlineButton";

export function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);

  const refreshVerification = async () => {
    try {
      setLoading(true);
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        Alert.alert("Verified", "Your campus email is verified. Continue using the app.");
      } else {
        Alert.alert("Pending", "Email is not verified yet. Check your inbox.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
    Alert.alert("Sent", "Verification email re-sent.");
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.emoji}>✉️</Text>
        <Text style={styles.title}>Verify your campus email</Text>
        <Text style={styles.text}>
          We sent a verification link to your institutional inbox. You must verify before accessing
          rides, bookings, and chat.
        </Text>
        <PrimaryButton
          label={loading ? "CHECKING..." : "I ALREADY VERIFIED"}
          onPress={refreshVerification}
          loading={loading}
        />
        <View style={styles.gap} />
        <OutlineButton label="RESEND EMAIL" onPress={resend} />
        <View style={styles.gap} />
        <OutlineButton label="LOGOUT" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
    minHeight: "100%" as unknown as number,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 10 },
  text: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 22 },
  gap: { height: 10 },
});
