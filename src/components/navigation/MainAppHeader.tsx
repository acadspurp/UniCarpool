import type { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "../ui/AppIcon";
import { useMobileShell } from "../../context/MobileShellContext";
import { useResponsive } from "../../hooks/useResponsive";
import { navigateToMainTab } from "../../navigation/rootNavigation";
import { colors } from "../../theme/colors";

export function MainAppHeader(_props: BottomTabHeaderProps) {
  const { isWide } = useResponsive();
  const { openMenu, openNotifications } = useMobileShell();
  const showMenu = !isWide;

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {showMenu ? (
          <Pressable
            style={styles.iconBtn}
            onPress={openMenu}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <AppIcon name="menu" size={24} color={colors.primary} />
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.brandWrap, !showMenu && styles.brandWrapFlush]}
          onPress={() => navigateToMainTab("Home")}
          accessibilityLabel="Go to home"
          accessibilityRole="button"
        >
          <Text style={styles.brand}>UniCarpool</Text>
          <Text style={styles.brandSub}>Campus rides</Text>
        </Pressable>
      </View>
      <Pressable
        style={styles.iconBtn}
        onPress={openNotifications}
        accessibilityLabel="Notifications"
        accessibilityRole="button"
      >
        <AppIcon name="notifications-outline" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 },
  brandWrap: { marginLeft: 8, flex: 1 },
  brandWrapFlush: { marginLeft: 0 },
  brand: { fontSize: 18, fontWeight: "800", color: colors.primary },
  brandSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
