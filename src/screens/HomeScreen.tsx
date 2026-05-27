import { StyleSheet, Text, View } from "react-native";
import { AppIcon } from "../components/ui/AppIcon";
import { ScreenContainer } from "../components/ScreenContainer";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";

export function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || "there";

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.greeting}>Hello, {firstName}!</Text>
        <Text style={styles.title}>What would you like to do?</Text>
      </View>

      <View style={styles.modeCard}>
        <View style={styles.modeHeader}>
          <View style={[styles.modeIconWrap, styles.driverIcon]}>
            <AppIcon name="car-sport" size={26} color={colors.primary} />
          </View>
          <View style={styles.modeTextWrap}>
            <Text style={styles.modeTitle}>Driver</Text>
            <Text style={styles.modeText}>Offer a ride with seats and departure time.</Text>
          </View>
        </View>
        <PrimaryButton label="POST RIDE" onPress={() => navigation.navigate("PostRide")} />
      </View>

      <View style={styles.modeCard}>
        <View style={styles.modeHeader}>
          <View style={[styles.modeIconWrap, styles.riderIcon]}>
            <AppIcon name="people" size={26} color={colors.accent} />
          </View>
          <View style={styles.modeTextWrap}>
            <Text style={styles.modeTitle}>Rider</Text>
            <Text style={styles.modeText}>Browse open rides and request a seat.</Text>
          </View>
        </View>
        <PrimaryButton
          label="FIND RIDE"
          onPress={() => navigation.navigate("FindRide")}
          variant="accent"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  greeting: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 4 },
  title: { color: colors.textOnPrimary, fontSize: 20, fontWeight: "800" },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  modeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  driverIcon: { backgroundColor: colors.surfaceMuted },
  riderIcon: { backgroundColor: colors.accentSoft },
  modeTextWrap: { flex: 1 },
  modeTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 2 },
  modeText: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
