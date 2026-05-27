import { PropsWithChildren } from "react";
import { Platform, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export function ScreenContainer({ children }: PropsWithChildren) {
  if (Platform.OS === "web") {
    return (
      <ScrollView
        style={styles.safeArea}
        contentContainerStyle={[styles.content, styles.webContent]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 16 },
  webContent: {
    minHeight: "100vh" as unknown as number,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
});
