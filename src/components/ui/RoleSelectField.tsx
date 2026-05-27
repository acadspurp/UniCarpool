import { createElement, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { AppIcon } from "./AppIcon";
import { CAMPUS_ROLE_OPTIONS, formatCampusRole } from "../../constants/campusRoles";
import type { CampusRole } from "../../types/models";
import { colors } from "../../theme/colors";

type Props = {
  label?: string;
  value: CampusRole;
  onChange: (value: CampusRole) => void;
  error?: string;
};

export function RoleSelectField({ label = "I am a", value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const display = formatCampusRole(value);

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrap}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={[styles.inputRow, error && styles.inputRowError]}>
          {createElement(
            "select",
            {
              value,
              onChange: (e: { target: { value: string } }) => onChange(e.target.value as CampusRole),
              style: webSelectStyle,
            },
            CAMPUS_ROLE_OPTIONS.map((opt) =>
              createElement("option", { key: opt.value, value: opt.value }, opt.label),
            ),
          )}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        style={[styles.inputRow, error && styles.inputRowError]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={styles.valueText}>{display}</Text>
        <AppIcon name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropTap} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select your role</Text>
            {CAMPUS_ROLE_OPTIONS.map((opt) => {
              const selected = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const webSelectStyle: ViewStyle = {
  width: "100%",
  border: "none",
  outlineStyle: "none",
  fontSize: 15,
  color: colors.text,
  backgroundColor: "transparent",
  padding: 0,
  fontFamily: "inherit",
  cursor: "pointer",
} as ViewStyle;

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  inputRowError: { borderColor: colors.danger },
  valueText: { fontSize: 15, color: colors.text, fontWeight: "600" },
  error: { marginTop: 6, fontSize: 12, color: colors.danger },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backdropTap: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  option: { paddingHorizontal: 16, paddingVertical: 14 },
  optionSelected: { backgroundColor: colors.surfaceMuted },
  optionText: { fontSize: 16, fontWeight: "600", color: colors.text },
  optionTextSelected: { color: colors.primary },
});
