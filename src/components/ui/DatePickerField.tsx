import { createElement, useState } from "react";
import { format } from "date-fns";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
};

function toDateInputValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DatePickerField({ label, value, onChange, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  const display = format(value, "EEE, MMM d, yyyy");

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.input}>
          {createElement("input", {
            type: "date",
            value: toDateInputValue(value),
            min: minimumDate ? toDateInputValue(minimumDate) : undefined,
            onChange: (e: { target: { value: string } }) => {
              const next = e.target.value;
              if (!next) return;
              const parsed = new Date(`${next}T12:00:00`);
              if (!Number.isNaN(parsed.getTime())) onChange(parsed);
            },
            style: webInputStyle,
          })}
        </View>
      </View>
    );
  }

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed") {
      setOpen(false);
      return;
    }
    if (selected) onChange(selected);
    if (Platform.OS === "android") setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={() => setOpen(true)} accessibilityRole="button">
        <Text style={styles.valueText}>{display}</Text>
        <Text style={styles.hint}>Tap to choose date</Text>
      </Pressable>
      {open && Platform.OS === "ios" ? (
        <Modal transparent animationType="slide" visible onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalBar}>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Text style={styles.done}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={value}
              mode="date"
              display="spinner"
              minimumDate={minimumDate}
              onChange={onPickerChange}
            />
          </View>
        </Modal>
      ) : null}
      {open && Platform.OS === "android" ? (
        <DateTimePicker
          value={value}
          mode="date"
          minimumDate={minimumDate}
          onChange={onPickerChange}
        />
      ) : null}
    </View>
  );
}

const webInputStyle: ViewStyle = {
  width: "100%",
  border: "none",
  outlineStyle: "none",
  fontSize: 15,
  color: colors.text,
  backgroundColor: "transparent",
  padding: 0,
  fontFamily: "inherit",
} as ViewStyle;

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueText: { fontSize: 15, color: colors.text, fontWeight: "600" },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalBar: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  done: { fontSize: 16, fontWeight: "700", color: colors.primary },
});
