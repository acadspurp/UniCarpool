import { PropsWithChildren } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScrollBottomPadding } from "../hooks/useScrollBottomPadding";
import { colors } from "../theme/colors";

type Props = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  /** Additional bottom space (e.g. sticky footer). */
  extraBottomPadding?: number;
}>;

export function ScreenContainer({
  children,
  scroll = true,
  padded = true,
  extraBottomPadding = 0,
}: Props) {
  const bottomPadding = useScrollBottomPadding(extraBottomPadding);

  const contentStyle = [
    styles.content,
    padded && styles.padded,
    styles.centered,
    { paddingBottom: bottomPadding },
  ];

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={contentStyle}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        nestedScrollEnabled
        bounces
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    ...(Platform.OS === "web"
      ? {
          overflow: "scroll" as "scroll",
          WebkitOverflowScrolling: "touch",
        }
      : {}),
  },
  content: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  centered: {
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
});
