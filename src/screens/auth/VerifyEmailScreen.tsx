import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { auth } from "../../services/firebase";
import {
  logout,
  sendCampusVerificationEmail,
  CAMPUS_DOMAIN,
  completeEmailVerificationFromLink,
  getEmailVerificationLinkParams,
  clearEmailVerificationQueryParams,
  getVerificationActionSettings,
} from "../../services/auth";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { OutlineButton } from "../../components/ui/OutlineButton";

export function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [lastResendError, setLastResendError] = useState<string | null>(null);
  const [initialSendDone, setInitialSendDone] = useState(false);
  const sentOnMount = useRef(false);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const email = auth.currentUser?.email ?? "your campus email";
  const continueUrl = getVerificationActionSettings().url;

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
        Alert.alert("Verification link error", error.message ?? "The link may be expired. Resend email.");
      } finally {
        setLinkLoading(false);
      }
    };
    handleIncomingLink();
  }, [refreshUser]);

  useEffect(() => {
    if (sentOnMount.current || !auth.currentUser || auth.currentUser.emailVerified) return;
    sentOnMount.current = true;
    sendCampusVerificationEmail(auth.currentUser)
      .then(() => {
        setInitialSendDone(true);
        setLastResendError(null);
      })
      .catch((error: Error) => {
        setLastResendError(error.message);
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
        "Open the link in the verification email, then tap this button again.\n\nCheck Spam/Junk and allow mail from Firebase (noreply@firebaseapp.com).",
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
      setLastResendError(null);
      await sendCampusVerificationEmail(auth.currentUser);
      setInitialSendDone(true);
      Alert.alert(
        "Verification email sent",
        `Firebase sent a new link to ${email}.\n\nAfter you click the link, you will return to:\n${continueUrl}\n\nCheck Spam/Junk if you do not see it within 5 minutes.`,
      );
    } catch (error: any) {
      const message =
        error?.code === "auth/too-many-requests"
          ? "Too many attempts. Wait a few minutes."
          : error.message ?? "Could not send email.";
      setLastResendError(message);
      Alert.alert("Resend failed", message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.emoji}>✉️</Text>
        <Text style={styles.title}>Verify your campus email</Text>
        <Text style={styles.text}>
          {initialSendDone ? "Verification email sent to:" : "Sending verification email to:"}
        </Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Firebase email checklist</Text>
          <Text style={styles.helpText}>
            1. Authentication → Sign-in method → Email/Password enabled{"\n"}
            2. Authentication → Templates → Email address verification → enabled{"\n"}
            3. Authentication → Settings → Authorized domains includes localhost and your deploy URL{"\n"}
            4. After clicking the email link, you return to:{"\n"}
            {continueUrl}
          </Text>
        </View>

        {lastResendError ? <Text style={styles.errorText}>Send error: {lastResendError}</Text> : null}

        {linkLoading ? (
          <Text style={styles.statusText}>Completing verification from email link...</Text>
        ) : null}

        <PrimaryButton
          label={loading ? "CHECKING..." : "I ALREADY VERIFIED"}
          onPress={refreshVerification}
          loading={loading}
        />
        <View style={styles.gap} />
        <OutlineButton label={resendLoading ? "SENDING..." : "RESEND EMAIL"} onPress={resend} />
        <View style={styles.gap} />
        <OutlineButton label="LOGOUT" onPress={logout} />
        <Text style={styles.footerNote}>
          Only {CAMPUS_DOMAIN} addresses can register. Institutional inboxes must allow Firebase mail.
        </Text>
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
  helpText: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  errorText: { fontSize: 12, color: "#dc2626", marginBottom: 12 },
  statusText: { fontSize: 13, color: colors.primary, marginBottom: 12, fontWeight: "600" },
  footerNote: { fontSize: 11, color: colors.textMuted, marginTop: 16, lineHeight: 16 },
  gap: { height: 10 },
});
