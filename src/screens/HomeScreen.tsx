import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { colors } from "../theme/colors";

export function HomeScreen({ navigation }: any) {
  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.greeting}>Welcome back 👋</Text>
        <Text style={styles.title}>Choose your mode</Text>
        <Text style={styles.subtitle}>
          Driver: offer a ride · Rider: search and request a seat
        </Text>
      </View>

      <View style={styles.modeCard}>
        <Text style={styles.modeEmoji}>🚗</Text>
        <Text style={styles.modeTitle}>Driver</Text>
        <Text style={styles.modeText}>Post a ride with seats, route, and departure time.</Text>
        <PrimaryButton label="POST RIDE" onPress={() => navigation.navigate("PostRide")} />
      </View>

      <View style={styles.modeCard}>
        <Text style={styles.modeEmoji}>🎒</Text>
        <Text style={styles.modeTitle}>Rider</Text>
        <Text style={styles.modeText}>Browse open rides and send a booking request.</Text>
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  greeting: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 4 },
  title: { color: colors.textOnPrimary, fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 19 },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeEmoji: { fontSize: 28, marginBottom: 8 },
  modeTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 4 },
  modeText: { fontSize: 13, color: colors.textMuted, marginBottom: 14, lineHeight: 19 },
});
