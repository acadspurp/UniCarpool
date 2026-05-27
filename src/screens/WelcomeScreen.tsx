import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors } from "../theme/colors";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { OutlineButton } from "../components/ui/OutlineButton";
import { useResponsive } from "../hooks/useResponsive";

const BENEFITS = [
  { icon: "🛡️", title: "Verified campus community", text: "Only @iskolarngbayan.pup.edu.ph accounts can join." },
  { icon: "🔒", title: "Secure rides", text: "Coordinate trips with verified students, faculty, and staff." },
  { icon: "💸", title: "Split travel costs", text: "Share fuel and fare — payments arranged between riders." },
  { icon: "🌱", title: "Reduce traffic", text: "Fewer solo trips to and from campus every day." },
];

const HOW_IT_WORKS = [
  { emoji: "🚗", title: "Post rides", text: "Drivers share trips from campus to home or key destinations." },
  { emoji: "🔍", title: "Find rides", text: "Riders browse open seats by route and departure time." },
  { emoji: "💺", title: "Request seats", text: "Send booking requests and get accepted by the driver." },
  { emoji: "💬", title: "In-app chat", text: "Coordinate pickup details safely per booking." },
];

export function WelcomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const { isWide, contentMaxWidth } = useResponsive();
  const cardWidth = Math.min(width - 48, 300);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={[styles.inner, isWide && styles.innerWide, { maxWidth: isWide ? 960 : contentMaxWidth }]}>
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>🚘</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PUP · Iskolar ng Bayan</Text>
          </View>
          <Text style={styles.logo}>
            Uni<Text style={styles.logoAccent}>Carpool</Text>
          </Text>
          <Text style={styles.tagline}>
            Campus carpooling for students, faculty, and staff — share rides, save costs, travel together.
          </Text>
          <PrimaryButton
            label="GET STARTED"
            onPress={() => navigation.navigate("Auth", { mode: "signup" })}
            variant="accent"
          />
          <View style={styles.signInRow}>
            <OutlineButton label="SIGN IN" onPress={() => navigation.navigate("Auth", { mode: "login" })} />
          </View>
        </View>

        <View style={styles.statsStrip}>
          <Text style={styles.statsTitle}>Optimized for campus mobility</Text>
          <Text style={styles.statsText}>Verified emails · Driver & rider modes · Mobile-friendly</Text>
        </View>

        <Text style={styles.sectionTitle}>Why UniCarpool</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          style={styles.carouselWrap}
        >
          {BENEFITS.map((item) => (
            <View key={item.title} style={[styles.benefitCard, { width: cardWidth }]}>
              <Text style={styles.benefitIcon}>{item.icon}</Text>
              <Text style={styles.benefitTitle}>{item.title}</Text>
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>How it works</Text>
        <Text style={styles.sectionSubtitle}>
          A streamlined experience for your daily campus commute.
        </Text>

        <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
          {HOW_IT_WORKS.map((item) => (
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
            • Cost sharing is arranged offline between riders and drivers
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerCopy}>© 2026 UniCarpool</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  inner: { paddingHorizontal: 16, paddingTop: 20, alignSelf: "center", width: "100%" },
  innerWide: { paddingHorizontal: 32, paddingTop: 40 },
  hero: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: { fontSize: 28 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  logo: { fontSize: 32, fontWeight: "800", color: colors.text, marginBottom: 8 },
  logoAccent: { color: colors.primary },
  tagline: { fontSize: 15, lineHeight: 22, color: colors.textMuted, marginBottom: 18 },
  signInRow: { marginTop: 10 },
  statsStrip: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
  },
  statsTitle: { color: colors.textOnPrimary, fontSize: 15, fontWeight: "800", marginBottom: 4 },
  statsText: { color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 19 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 6 },
  sectionSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 14, lineHeight: 20 },
  carouselWrap: { marginBottom: 22, marginHorizontal: -4 },
  carousel: { gap: 12, paddingHorizontal: 4, paddingBottom: 4 },
  benefitCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  benefitIcon: { fontSize: 26, marginBottom: 8 },
  benefitTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  benefitText: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  featureGrid: { gap: 10, marginBottom: 18 },
  featureGridWide: { flexDirection: "row", flexWrap: "wrap" },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureCardWide: { width: "48%", flexGrow: 1 },
  featureEmoji: { fontSize: 24, marginBottom: 6 },
  featureTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  featureText: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  noteCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  noteTitle: { fontSize: 15, fontWeight: "700", color: colors.primaryDark, marginBottom: 8 },
  noteText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  footerCopy: { fontSize: 12, color: colors.textMuted },
});
