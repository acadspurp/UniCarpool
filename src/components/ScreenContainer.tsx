import { PropsWithChildren } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  content: { flex: 1, padding: 16 },
});
