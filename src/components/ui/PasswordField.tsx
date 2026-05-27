import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  label?: string;
};

export function PasswordField({ label, style, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          {...props}
          secureTextEntry={!visible}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={8}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  inputRow: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 48,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
