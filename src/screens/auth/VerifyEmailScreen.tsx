import { useState } from "react";
import { Alert, Button, Text } from "react-native";
import { sendEmailVerification } from "firebase/auth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { auth } from "../../services/firebase";
import { logout } from "../../services/auth";

export function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);

  const refreshVerification = async () => {
    try {
      setLoading(true);
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        Alert.alert("Verified", "Your campus email is verified. Continue using the app.");
      } else {
        Alert.alert("Pending", "Email is not verified yet.");
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
    <ScreenContainer>
      <Text>Verify your institutional email before accessing rides and chat.</Text>
      <Button title={loading ? "Checking..." : "I already verified"} onPress={refreshVerification} />
      <Button title="Resend verification email" onPress={resend} />
      <Button title="Logout" onPress={logout} />
    </ScreenContainer>
  );
}
