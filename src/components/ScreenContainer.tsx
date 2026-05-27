import { PropsWithChildren } from "react";
import { Platform, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

type Props = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
}>;

export function ScreenContainer({ children, scroll = true, padded = true }: Props) {
  const contentStyle = [styles.content, padded && styles.padded, styles.webContent];

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={contentStyle}>{children}</View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === "web") {
    return (
      <ScrollView
        style={styles.safeArea}
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  padded: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 20 },
  webContent: {
    minHeight: "100vh" as unknown as number,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
});
