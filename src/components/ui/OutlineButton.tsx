import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  light?: boolean;
  danger?: boolean;
  disabled?: boolean;
};

export function OutlineButton({ label, onPress, light, danger, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        danger ? styles.danger : light ? styles.light : styles.dark,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, light && styles.labelLight, danger && styles.labelDanger]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 2,
    minHeight: 50,
  },
  light: { borderColor: colors.textOnPrimary },
  dark: { borderColor: colors.primary },
  danger: { borderColor: colors.danger },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { color: colors.primary, fontWeight: "700", fontSize: 14, letterSpacing: 0.8 },
  labelLight: { color: colors.textOnPrimary },
  labelDanger: { color: colors.danger },
});
