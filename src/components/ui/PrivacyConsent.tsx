import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  checked: boolean;
  onToggle: () => void;
  error?: string;
};

export function PrivacyConsent({ checked, onToggle, error }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.row}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? <Text style={styles.check}>✓</Text> : null}
        </View>
        <Text style={styles.label}>
          I agree that UniCarpool may use my account information for verification, ride matching,
          and related campus carpool services, in line with applicable data privacy practices.
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  check: { color: colors.textOnPrimary, fontSize: 14, fontWeight: "800" },
  label: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  error: { marginTop: 6, fontSize: 12, color: colors.danger, marginLeft: 34 },
});
