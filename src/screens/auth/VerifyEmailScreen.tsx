import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { auth } from "../../services/firebase";
import { logout, sendCampusVerificationEmail, CAMPUS_DOMAIN } from "../../services/auth";
import { confirmCampusEmailServerSide } from "../../services/campusVerification";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { OutlineButton } from "../../components/ui/OutlineButton";

export function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [campusLoading, setCampusLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [lastResendError, setLastResendError] = useState<string | null>(null);
  const [initialSendDone, setInitialSendDone] = useState(false);
  const sentOnMount = useRef(false);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const email = auth.currentUser?.email ?? "your campus email";

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
        "If email never arrives, use “Verify campus account (server)” below — PUP inboxes often block Firebase mail.",
      );
    } catch (error: any) {
      Alert.alert("Could not check status", error.message ?? "Try again or log out and sign in.");
    } finally {
      setLoading(false);
    }
  };

  const verifyViaServer = async () => {
    try {
      setCampusLoading(true);
      await confirmCampusEmailServerSide();
      const user = await refreshUser();
      if (user?.emailVerified) {
        Alert.alert("Verified", "Your campus account is verified. You can use the app now.");
      } else {
        Alert.alert(
          "Almost done",
          "Log out and sign in again so your session picks up verified status.",
        );
      }
    } catch (error: any) {
      const code = error?.code ?? "";
      if (code === "functions/not-found" || code === "functions/unavailable") {
        Alert.alert(
          "Server verification not deployed",
          "Deploy Cloud Functions first:\nfirebase deploy --only functions\n\nOr in Firebase Console → Authentication → Users → your account → mark email as verified.",
        );
      } else {
        Alert.alert("Verification failed", error.message ?? "Try again.");
      }
    } finally {
      setCampusLoading(false);
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
        "Request sent",
        `Firebase accepted the send request for ${email}. Check Inbox and Spam. If nothing arrives in 5 minutes, use server verification below.`,
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
          {initialSendDone
            ? "Verification email requested for:"
            : "We will try to send a link to:"}
        </Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>No email? This is common with school inboxes</Text>
          <Text style={styles.helpText}>
            • Check Spam/Junk for sender @firebaseapp.com{"\n"}
            • PUP mail may block Firebase — use server verification below{"\n"}
            • Or Firebase Console → Authentication → Users → your row → verify email manually
          </Text>
        </View>

        {lastResendError ? (
          <Text style={styles.errorText}>Last error: {lastResendError}</Text>
        ) : null}

        <PrimaryButton
          label={campusLoading ? "VERIFYING..." : "VERIFY CAMPUS ACCOUNT (SERVER)"}
          onPress={verifyViaServer}
          loading={campusLoading}
          variant="accent"
        />
        <View style={styles.gap} />
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
          Server verification only works for {CAMPUS_DOMAIN} and requires Cloud Functions deploy.
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
  footerNote: { fontSize: 11, color: colors.textMuted, marginTop: 16, lineHeight: 16 },
  gap: { height: 10 },
});
