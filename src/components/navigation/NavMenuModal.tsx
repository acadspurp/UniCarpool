import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { AppIcon, type AppIconName } from "../ui/AppIcon";
import { useMobileShell } from "../../context/MobileShellContext";
import { colors } from "../../theme/colors";

type TabRoute = "Home" | "FindRide" | "MyRides" | "Profile";

const MENU_ITEMS: { route: TabRoute; label: string; icon: AppIconName }[] = [
  { route: "Home", label: "Home", icon: "home" },
  { route: "FindRide", label: "Find Ride", icon: "search" },
  { route: "MyRides", label: "My Rides", icon: "car" },
  { route: "Profile", label: "Profile", icon: "person" },
];

export function NavMenuModal() {
  const { menuOpen, closeMenu } = useMobileShell();
  const navigation = useNavigation<BottomTabNavigationProp<Record<TabRoute, undefined>>>();
  const route = useRoute();
  const active = route.name as TabRoute;

  const goTo = (name: TabRoute) => {
    closeMenu();
    navigation.navigate(name);
  };

  return (
    <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
      <Pressable style={styles.backdrop} onPress={closeMenu} accessibilityLabel="Close menu">
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.sheetTitle}>Menu</Text>
          {MENU_ITEMS.map((item) => {
            const selected = active === item.route;
            return (
              <Pressable
                key={item.route}
                style={[styles.row, selected && styles.rowActive]}
                onPress={() => goTo(item.route)}
              >
                <AppIcon
                  name={item.icon}
                  size={22}
                  color={selected ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.rowLabel, selected && styles.rowLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    paddingTop: 56,
    paddingHorizontal: 14,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 320,
    width: "100%",
    alignSelf: "flex-start",
  },
  sheetTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowActive: { backgroundColor: colors.surfaceMuted },
  rowLabel: { fontSize: 16, fontWeight: "600", color: colors.text, marginLeft: 12 },
  rowLabelActive: { color: colors.primary },
});
