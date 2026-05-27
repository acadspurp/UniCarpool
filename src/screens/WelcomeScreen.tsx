import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { OutlineButton } from "../components/ui/OutlineButton";
import { useResponsive } from "../hooks/useResponsive";

const FEATURES = [
  {
    emoji: "🚗",
    title: "Post rides",
    text: "Drivers share trips from campus to home or key destinations.",
  },
  {
    emoji: "🔍",
    title: "Find rides",
    text: "Riders browse open seats by route and departure time.",
  },
  {
    emoji: "💺",
    title: "Request seats",
    text: "Send booking requests and get accepted by the driver.",
  },
  {
    emoji: "💬",
    title: "In-app chat",
    text: "Coordinate pickup details safely per booking.",
  },
];

export function WelcomeScreen({ navigation }: any) {
  const { isWide, contentMaxWidth } = useResponsive();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={[styles.inner, isWide && styles.innerWide, { maxWidth: isWide ? 960 : contentMaxWidth }]}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PUP · Iskolar ng Bayan</Text>
          </View>
          <Text style={styles.logo}>
            Uni<Text style={styles.logoAccent}>Carpool</Text>
          </Text>
          <Text style={styles.tagline}>
            Campus carpooling for students, faculty, and staff — share rides, save costs, travel together.
          </Text>
          <View style={styles.ctaRow}>
            <PrimaryButton
              label="GET STARTED"
              onPress={() => navigation.navigate("Auth", { mode: "signup" })}
              variant="accent"
            />
            <OutlineButton label="SIGN IN" onPress={() => navigation.navigate("Auth", { mode: "login" })} />
          </View>
        </View>

        <View style={styles.statsStrip}>
          <Stat label="Campus-only" value="@iskolarngbayan.pup.edu.ph" />
          <Stat label="Modes" value="Driver & Rider" />
          <Stat label="Built for" value="Mobile web" />
        </View>

        <Text style={styles.sectionTitle}>What to expect</Text>
        <Text style={styles.sectionSubtitle}>
          A simple MVP flow tailored for your thesis demo and daily campus commute.
        </Text>

        <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
          {FEATURES.map((item) => (
            <View key={item.title} style={[styles.featureCard, isWide && styles.featureCardWide]}>
              <Text style={styles.featureEmoji}>{item.emoji}</Text>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Before you ride</Text>
          <Text style={styles.noteText}>
            • Sign up with your institutional email{"\n"}
            • Verify your email before full access{"\n"}
            • Complete your profile (department, phone, optional vehicle){"\n"}
            • No in-app payments — cost sharing is arranged offline
          </Text>
        </View>

        <PrimaryButton
          label="CREATE CAMPUS ACCOUNT"
          onPress={() => navigation.navigate("Auth", { mode: "signup" })}
        />
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  inner: { paddingHorizontal: 20, paddingTop: 28, alignSelf: "center", width: "100%" },
  innerWide: { paddingHorizontal: 40, paddingTop: 48 },
  hero: { marginBottom: 24 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  badgeText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  logo: { fontSize: 36, fontWeight: "800", color: colors.text, marginBottom: 10 },
  logoAccent: { color: colors.primary },
  tagline: { fontSize: 16, lineHeight: 24, color: colors.textMuted, marginBottom: 22 },
  ctaRow: { gap: 12 },
  statsStrip: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    gap: 12,
  },
  stat: { gap: 2 },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "600" },
  statValue: { color: colors.textOnPrimary, fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 6 },
  sectionSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 18, lineHeight: 20 },
  featureGrid: { gap: 12, marginBottom: 20 },
  featureGridWide: { flexDirection: "row", flexWrap: "wrap" },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  featureCardWide: { width: "48%", flexGrow: 1 },
  featureEmoji: { fontSize: 28, marginBottom: 8 },
  featureTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 4 },
  featureText: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  noteCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  noteTitle: { fontSize: 15, fontWeight: "700", color: colors.primaryDark, marginBottom: 8 },
  noteText: { fontSize: 13, color: colors.textMuted, lineHeight: 21 },
});
