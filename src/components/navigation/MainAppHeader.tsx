import type { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "../ui/AppIcon";
import { useMobileShell } from "../../context/MobileShellContext";
import { colors } from "../../theme/colors";

export function MainAppHeader(_props: BottomTabHeaderProps) {
  const { openMenu, openNotifications } = useMobileShell();

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Pressable
          style={styles.iconBtn}
          onPress={openMenu}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
        >
          <AppIcon name="menu" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.brandWrap}>
          <Text style={styles.brand}>UniCarpool</Text>
          <Text style={styles.brandSub}>Campus rides</Text>
        </View>
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
