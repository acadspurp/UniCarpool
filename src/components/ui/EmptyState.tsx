import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  emoji: string;
  title: string;
  message: string;
};

export function EmptyState({ emoji, title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 6, textAlign: "center" },
  message: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 21 },
});
