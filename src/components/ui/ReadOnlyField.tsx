import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function ReadOnlyField({ label, value, hint }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Text style={styles.value}>{value}</Text>
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  box: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  value: { fontSize: 15, fontWeight: "600", color: colors.text },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 17 },
});
