import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "accent";
};

export function PrimaryButton({ label, onPress, loading, variant = "primary" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        variant === "accent" ? styles.accent : styles.primary,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textOnPrimary} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  primary: { backgroundColor: colors.primary },
  accent: { backgroundColor: colors.accent },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.7 },
  label: {
    color: colors.textOnPrimary,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.8,
  },
});
