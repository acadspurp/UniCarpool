import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "../ui/AppIcon";
import { useMobileShell } from "../../context/MobileShellContext";
import { getActiveMainTab, navigateToMainTab, type MainTabName } from "../../navigation/rootNavigation";
import { colors } from "../../theme/colors";

const MENU_ITEMS: { route: MainTabName; label: string; icon: AppIconName }[] = [
  { route: "Home", label: "Home", icon: "home" },
  { route: "FindRide", label: "Find Ride", icon: "search" },
  { route: "MyRides", label: "My Rides", icon: "car" },
  { route: "Profile", label: "Profile", icon: "person" },
];

export function NavMenuModal() {
  const { menuOpen, closeMenu } = useMobileShell();
  const [active, setActive] = useState<MainTabName>("Home");

  useEffect(() => {
    if (menuOpen) setActive(getActiveMainTab());
  }, [menuOpen]);

  const goTo = (name: MainTabName) => {
    closeMenu();
    navigateToMainTab(name);
  };

  return (
    <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropTap}
          onPress={closeMenu}
          accessibilityLabel="Close menu"
        />
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
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
        </View>
      </View>
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
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
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
    zIndex: 1,
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
