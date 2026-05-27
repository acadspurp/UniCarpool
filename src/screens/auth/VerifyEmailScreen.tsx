import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { auth } from "../../services/firebase";
import { logout, sendCampusVerificationEmail } from "../../services/auth";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { OutlineButton } from "../../components/ui/OutlineButton";

export function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [initialSendDone, setInitialSendDone] = useState(false);
  const sentOnMount = useRef(false);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const email = auth.currentUser?.email ?? "your campus email";

  useEffect(() => {
    if (sentOnMount.current || !auth.currentUser || auth.currentUser.emailVerified) return;
    sentOnMount.current = true;
    sendCampusVerificationEmail(auth.currentUser)
      .then(() => setInitialSendDone(true))
      .catch((error: Error) => {
        console.warn("Auto-send verification failed:", error.message);
      });
  }, []);

  const refreshVerification = async () => {
    try {
      setLoading(true);
      const user = await refreshUser();
      if (user?.emailVerified) {
        Alert.alert("Verified", "Your campus email is verified. Welcome to UniCarpool!");
        return;
      }
      Alert.alert(
        "Not verified yet",
        "Firebase still shows your email as unverified.\n\n• Open the link in the email from Firebase (check Spam/Junk)\n• Wait a minute, then tap this button again\n• Or tap Resend Email if you never got one",
      );
    } catch (error: any) {
      Alert.alert("Could not check status", error.message ?? "Try again or log out and sign in.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!auth.currentUser) {
      Alert.alert("Session expired", "Please log in again.");
      return;
    }
    try {
      setResendLoading(true);
      await sendCampusVerificationEmail(auth.currentUser);
      setInitialSendDone(true);
      Alert.alert(
        "Verification email sent",
        `Check ${email} including Spam/Junk. The sender may appear as noreply@firebaseapp.com.`,
      );
    } catch (error: any) {
      const message = error?.code === "auth/too-many-requests"
        ? "Too many attempts. Wait a few minutes, then try again."
        : error.message ?? "Could not send email. Check Firebase Authentication settings.";
      Alert.alert("Resend failed", message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.emoji}>✉️</Text>
        <Text style={styles.title}>Verify your campus email</Text>
        <Text style={styles.text}>
          {initialSendDone
            ? "We sent a verification link to:"
            : "A verification link will be sent to:"}
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.text}>
          Open the link in that inbox (check Spam/Junk), then tap “I already verified” below.
        </Text>
        <PrimaryButton
          label={loading ? "CHECKING..." : "I ALREADY VERIFIED"}
          onPress={refreshVerification}
          loading={loading}
        />
        <View style={styles.gap} />
        <OutlineButton
          label={resendLoading ? "SENDING..." : "RESEND EMAIL"}
          onPress={resend}
        />
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
  text: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 8 },
  email: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  gap: { height: 10 },
});
