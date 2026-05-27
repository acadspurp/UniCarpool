import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function PerPersonPriceField({
  label = "Share per person",
  value,
  onChange,
  error,
}: Props) {
  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    onChange(cleaned);
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        <Text style={styles.currency}>₱</Text>
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          style={styles.input}
          accessibilityLabel="Amount per person in pesos"
        />
        <Text style={styles.suffix}>per person</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 14,
    paddingRight: 12,
    minHeight: 50,
  },
  inputRowError: { borderColor: colors.danger },
  currency: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 14,
    minWidth: 48,
  },
  suffix: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginLeft: 8,
  },
  error: { marginTop: 6, fontSize: 12, color: colors.danger },
});
