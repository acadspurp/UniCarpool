import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "./AppIcon";
import { colors } from "../../theme/colors";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function StepperField({ label, value, onChange, min = 1, max = 8 }: Props) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
          onPress={decrease}
          disabled={value <= min}
          accessibilityLabel="Decrease seats"
        >
          <AppIcon
            name="chevron-down"
            size={22}
            color={value <= min ? colors.textMuted : colors.primary}
          />
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
          onPress={increase}
          disabled={value >= max}
          accessibilityLabel="Increase seats"
        >
          <AppIcon
            name="chevron-up"
            size={22}
            color={value >= max ? colors.textMuted : colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: { opacity: 0.5 },
  value: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    minWidth: 48,
    textAlign: "center",
    marginHorizontal: 20,
  },
});
