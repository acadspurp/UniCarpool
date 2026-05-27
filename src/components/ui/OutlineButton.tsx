import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  light?: boolean;
};

export function OutlineButton({ label, onPress, light }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        light ? styles.light : styles.dark,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, light && styles.labelLight]}>{label}</Text>
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
  pressed: { opacity: 0.85 },
  label: { color: colors.primary, fontWeight: "700", fontSize: 14, letterSpacing: 0.8 },
  labelLight: { color: colors.textOnPrimary },
});
