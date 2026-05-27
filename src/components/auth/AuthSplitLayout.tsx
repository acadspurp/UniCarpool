import { PropsWithChildren } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { colors } from "../../theme/colors";
import { OutlineButton } from "../ui/OutlineButton";
import { useResponsive } from "../../hooks/useResponsive";

type AuthVariant = "login" | "signup";

type Props = PropsWithChildren<{
  variant: AuthVariant;
  title: string;
  subtitle?: string;
  promoTitle: string;
  promoText: string;
  switchLabel: string;
  onSwitch: () => void;
}>;

function PromoPanel({
  title,
  text,
  switchLabel,
  onSwitch,
}: {
  title: string;
  text: string;
  switchLabel: string;
  onSwitch: () => void;
}) {
  return (
    <View style={styles.promoPanel}>
      <View style={styles.promoCurve} />
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>{title}</Text>
        <Text style={styles.promoText}>{text}</Text>
        <OutlineButton label={switchLabel} onPress={onSwitch} light />
      </View>
    </View>
  );
}

function FormPanel({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <View style={styles.formPanel}>
      <Text style={styles.formTitle}>{title}</Text>
      {subtitle ? <Text style={styles.formSubtitle}>{subtitle}</Text> : null}
      <Text style={styles.hint}>Use your @iskolarngbayan.pup.edu.ph email</Text>
      {children}
    </View>
  );
}

export function AuthSplitLayout({
  variant,
  title,
  subtitle,
  promoTitle,
  promoText,
  switchLabel,
  onSwitch,
  children,
}: Props) {
  const { isWide } = useResponsive();
  const { height } = useWindowDimensions();

  const promo = (
    <PromoPanel
      title={promoTitle}
      text={promoText}
      switchLabel={switchLabel}
      onSwitch={onSwitch}
    />
  );

  const form = (
    <FormPanel title={title} subtitle={subtitle}>
      {children}
    </FormPanel>
  );

  if (isWide) {
    return (
      <View style={[styles.root, { minHeight: height }]}>
        <View style={styles.wideRow}>
          {variant === "login" ? form : promo}
          {variant === "login" ? promo : form}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.mobileScroll}
      keyboardShouldPersistTaps="handled"
    >
      {variant === "login" ? form : promo}
      {variant === "login" ? promo : form}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    minHeight: "100%" as unknown as number,
  },
  mobileScroll: { flexGrow: 1 },
  wideRow: { flex: 1, flexDirection: "row", maxWidth: 1100, width: "100%", alignSelf: "center" },
  formPanel: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 36,
    justifyContent: "center",
    backgroundColor: colors.surface,
    minWidth: 280,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  formSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  hint: { fontSize: 12, color: colors.primary, marginBottom: 20, fontWeight: "600" },
  promoPanel: {
    flex: 1,
    backgroundColor: colors.primary,
    minHeight: 260,
    overflow: "hidden",
    justifyContent: "center",
  },
  promoCurve: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primaryLight,
    opacity: 0.35,
    top: -60,
    right: -40,
  },
  promoContent: {
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: "flex-start",
  },
  promoTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textOnPrimary,
    marginBottom: 12,
  },
  promoText: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    marginBottom: 24,
    maxWidth: 320,
  },
});
