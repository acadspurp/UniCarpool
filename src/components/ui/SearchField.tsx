import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { AppIcon } from "./AppIcon";
import { colors } from "../../theme/colors";

type Props = TextInputProps;

export function SearchField(props: Props) {
  return (
    <View style={styles.wrap}>
      <AppIcon name="search" size={20} color={colors.textMuted} style={styles.icon} />
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    minHeight: 52,
  },
  icon: { marginLeft: 14 },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
});
