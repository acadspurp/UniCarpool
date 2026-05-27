import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { auth } from "../../services/firebase";
import {
  logout,
  sendCampusVerificationEmail,
  CAMPUS_DOMAIN,
  completeEmailVerificationFromLink,
  getEmailVerificationLinkParams,
  clearEmailVerificationQueryParams,
} from "../../services/auth";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { OutlineButton } from "../../components/ui/OutlineButton";

const RESEND_COOLDOWN_SEC = 300;

export function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const email = auth.currentUser?.email ?? "your campus email";

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const handleIncomingLink = async () => {
      const { mode, oobCode } = getEmailVerificationLinkParams();
      if (mode !== "verifyEmail" || !oobCode) return;

      try {
        setLinkLoading(true);
        await completeEmailVerificationFromLink(oobCode);
        clearEmailVerificationQueryParams();
        const user = await refreshUser();
        if (user?.emailVerified) {
          Alert.alert("Email verified", "Your campus email is confirmed. Welcome to UniCarpool!");
        }
      } catch (error: any) {
        Alert.alert("Verification link error", error.message ?? "The link may be expired. Try resend later.");
      } finally {
        setLinkLoading(false);
      }
    };
    handleIncomingLink();
  }, [refreshUser]);

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
        "Open the verification link in your email first, then tap this button again.",
      );
    } catch (error: any) {
      Alert.alert("Could not check status", error.message ?? "Try again or log out and sign in.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendCooldown > 0) return;
    if (!auth.currentUser) {
      Alert.alert("Session expired", "Please log in again.");
      return;
    }
    try {
      setResendLoading(true);
      setStatusMessage(null);
      await sendCampusVerificationEmail(auth.currentUser);
      setStatusMessage("A new verification email was sent. Check your inbox and spam folder.");
      Alert.alert("Email sent", `A verification link was sent to ${email}.`);
    } catch (error: any) {
      if (error?.code === "auth/too-many-requests") {
        setResendCooldown(RESEND_COOLDOWN_SEC);
        setStatusMessage("Too many resend attempts. Please wait about 5 minutes, then try again.");
        Alert.alert("Please wait", "You requested too many emails. Wait 5 minutes before resending.");
      } else {
        setStatusMessage(error.message ?? "Could not send email. Try again later.");
        Alert.alert("Resend failed", error.message ?? "Could not send email.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  const resendLabel =
    resendLoading
      ? "SENDING..."
      : resendCooldown > 0
        ? `WAIT ${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, "0")}`
        : "RESEND EMAIL";

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.emoji}>✉️</Text>
        <Text style={styles.title}>Verify your campus email</Text>
        <Text style={styles.text}>We sent a verification link to:</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>What you need to do</Text>
          <Text style={styles.helpText}>
            1. Open your PUP email inbox ({CAMPUS_DOMAIN}){"\n"}
            2. Check Inbox, Spam, and Junk folders{"\n"}
            3. Look for an email about verifying your account{"\n"}
            4. Tap the verification link in that email{"\n"}
            5. Come back here and tap “I already verified”{"\n\n"}
            Did not receive it? Wait 5 minutes, then tap “Resend email” once.
          </Text>
        </View>

        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

        {linkLoading ? (
          <Text style={styles.statusText}>Completing verification from your email link...</Text>
        ) : null}

        <PrimaryButton
          label={loading ? "CHECKING..." : "I ALREADY VERIFIED"}
          onPress={refreshVerification}
          loading={loading}
        />
        <View style={styles.gap} />
        <OutlineButton
          label={resendLabel}
          onPress={resend}
        />
        <View style={styles.gap} />
        <OutlineButton label="LOGOUT" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
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
  email: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 14 },
  helpBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  helpTitle: { fontWeight: "700", color: colors.primaryDark, marginBottom: 6, fontSize: 13 },
  helpText: { fontSize: 12, color: colors.textMuted, lineHeight: 20 },
  statusText: { fontSize: 13, color: colors.primary, marginBottom: 12, fontWeight: "600", lineHeight: 19 },
  gap: { height: 10 },
});
