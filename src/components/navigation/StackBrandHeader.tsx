import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "../ui/AppIcon";
import { useMobileShell } from "../../context/MobileShellContext";
import { navigateToMainTab } from "../../navigation/rootNavigation";
import { colors } from "../../theme/colors";

export function StackBrandHeader() {
  const navigation = useNavigation();
  const { openNotifications, pendingDriverCount } = useMobileShell();
  const canGoBack = navigation.canGoBack();

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {canGoBack ? (
          <Pressable
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <AppIcon name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.brandWrap, !canGoBack && styles.brandWrapFlush]}
          onPress={() => navigateToMainTab("Home")}
          accessibilityLabel="Go to home"
          accessibilityRole="button"
        >
          <Text style={styles.brand}>
            Uni<Text style={styles.brandAccent}>Carpool</Text>
          </Text>
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
        {pendingDriverCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {pendingDriverCount > 9 ? "9+" : pendingDriverCount}
            </Text>
          </View>
        ) : null}
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
  brand: { fontSize: 18, fontWeight: "800", color: colors.text },
  brandAccent: { color: colors.primary },
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
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: colors.textOnPrimary },
});
