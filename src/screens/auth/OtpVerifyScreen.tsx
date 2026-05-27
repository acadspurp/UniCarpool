import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../services/firebase";
import { logout, CAMPUS_DOMAIN } from "../../services/auth";
import { sendEmailOtp, verifyEmailOtp } from "../../services/otp";
import { getOtpErrorMessage, isOtpRateLimited } from "../../utils/otpError";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { OutlineButton } from "../../components/ui/OutlineButton";

const RESEND_COOLDOWN_SEC = 60;

export function OtpVerifyScreen() {
  const [code, setCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const sentOnMount = useRef(false);
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
    if (sentOnMount.current) return;
    sentOnMount.current = true;
    requestOtp();
  }, []);

  const requestOtp = async () => {
    try {
      setResendLoading(true);
      setStatusMessage(null);
      await sendEmailOtp();
      setStatusMessage("A 6-digit code was sent to your email. Check inbox and spam.");
    } catch (error: unknown) {
      const message = getOtpErrorMessage(error);
      if (isOtpRateLimited(error)) {
        setResendCooldown(RESEND_COOLDOWN_SEC);
      }
      setStatusMessage(message);
    } finally {
      setResendLoading(false);
    }
  };

  const onVerify = async () => {
    if (code.length !== 6) {
      Alert.alert("Invalid code", "Enter all 6 digits from your email.");
      return;
    }
    try {
      setVerifyLoading(true);
      await verifyEmailOtp(code);
      await refreshUser();
      Alert.alert("Verified", "Your campus email is verified. Welcome to UniCarpool!");
    } catch (error: unknown) {
      Alert.alert("Verification failed", getOtpErrorMessage(error));
    } finally {
      setVerifyLoading(false);
    }
  };

  const resendLabel =
    resendLoading
      ? "SENDING..."
      : resendCooldown > 0
        ? `RESEND IN ${resendCooldown}s`
        : "RESEND CODE";

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.text}>We sent a 6-digit code to:</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>What you need to do</Text>
          <Text style={styles.helpText}>
            1. Open your {CAMPUS_DOMAIN} inbox{"\n"}
            2. Check Inbox, Spam, and Junk{"\n"}
            3. Find the email from UniCarpool{"\n"}
            4. Enter the 6-digit code below{"\n"}
            5. Tap Verify to continue
          </Text>
        </View>

        <TextInput
          style={styles.otpInput}
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          textAlign="center"
        />

        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

        <PrimaryButton
          label={verifyLoading ? "VERIFYING..." : "VERIFY"}
          onPress={onVerify}
          loading={verifyLoading}
        />
        <View style={styles.gap} />
        <OutlineButton label={resendLabel} onPress={requestOtp} />
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
  text: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  email: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 14 },
  helpBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  helpTitle: { fontWeight: "700", color: colors.primaryDark, marginBottom: 6, fontSize: 13 },
  helpText: { fontSize: 12, color: colors.textMuted, lineHeight: 20 },
  otpInput: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 10,
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    marginBottom: 14,
  },
  statusText: { fontSize: 13, color: colors.primary, marginBottom: 12, lineHeight: 19 },
  gap: { height: 10 },
});
