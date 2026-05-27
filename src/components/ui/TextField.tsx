import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../../theme/colors";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  /** Force typed text to uppercase (e.g. origin / destination). */
  uppercase?: boolean;
};

export function TextField({ label, error, hint, uppercase, style, onChangeText, ...props }: Props) {
  const handleChange = (text: string) => {
    onChangeText?.(uppercase ? text.toUpperCase() : text);
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && styles.inputError, style]}
        autoCapitalize={uppercase ? "characters" : props.autoCapitalize}
        onChangeText={handleChange}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: { borderColor: colors.danger },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 17 },
  error: { marginTop: 6, fontSize: 12, color: colors.danger },
});
