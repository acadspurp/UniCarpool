import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMobileShell } from "../../context/MobileShellContext";
import { colors } from "../../theme/colors";

const SLIDE_DISTANCE = 480;
const OPEN_MS = 280;
const CLOSE_MS = 260;

export function NotificationsPanel() {
  const {
    notificationsOpen,
    closeNotifications,
    visibleNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    isNotificationUnread,
  } = useMobileShell();
  const [mounted, setMounted] = useState(false);
  const slideY = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);
  const markedOnOpenRef = useRef(false);

  const animateOpen = useCallback(() => {
    slideY.setValue(SLIDE_DISTANCE);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: 0,
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: OPEN_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideY, backdropOpacity]);

  const dismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: SLIDE_DISTANCE,
        duration: CLOSE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: CLOSE_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      closingRef.current = false;
      if (finished) {
        setMounted(false);
        closeNotifications();
      }
    });
  }, [slideY, backdropOpacity, closeNotifications]);

  useEffect(() => {
    if (!notificationsOpen) {
      markedOnOpenRef.current = false;
      return;
    }
    closingRef.current = false;
    setMounted(true);
    requestAnimationFrame(() => animateOpen());
  }, [notificationsOpen, animateOpen]);

  useEffect(() => {
    if (!notificationsOpen || !mounted || markedOnOpenRef.current) return;
    markedOnOpenRef.current = true;
    void markAllNotificationsRead();
  }, [notificationsOpen, mounted, markAllNotificationsRead]);

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            style={styles.backdropTap}
            onPress={dismiss}
            accessibilityLabel="Close notifications"
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            Platform.OS === "web" && styles.panelWeb,
            { transform: [{ translateY: slideY }] },
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Notifications</Text>
            <Pressable onPress={dismiss} hitSlop={8}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {visibleNotifications.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔔</Text>
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptyText}>
                  Ride requests and booking updates will appear here when you have activity.
                </Text>
              </View>
            ) : (
              visibleNotifications.map((item) => {
                const unread = isNotificationUnread(item.id);
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.logRow, unread && styles.logRowUnread]}
                    onPress={() => void markNotificationRead([item.id])}
                  >
                    <View style={styles.logBody}>
                      {unread ? <View style={styles.unreadDot} /> : null}
                      <View style={styles.logText}>
                        <Text style={[styles.logTitle, unread && styles.logTitleUnread]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.logDetail, unread && styles.logDetailUnread]}>
                          {item.detail}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e?.stopPropagation?.();
                        void deleteNotification(item.id);
                      }}
                      hitSlop={8}
                      accessibilityLabel="Delete notification"
                    >
                      <Text style={styles.delete}>Delete</Text>
                    </Pressable>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdropTap: {
    flex: 1,
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "72%",
    minHeight: 220,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  panelWeb: {
    maxHeight: "72vh" as unknown as number,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  panelTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  close: { fontSize: 14, fontWeight: "600", color: colors.primary },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 28, flexGrow: 1 },
  empty: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 12 },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logRowUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    paddingLeft: 10,
    marginLeft: -10,
    backgroundColor: "#FFF5F5",
  },
  logBody: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 8, minWidth: 0 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginTop: 6,
  },
  logText: { flex: 1, minWidth: 0 },
  logTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  logTitleUnread: { color: colors.danger },
  logDetail: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  logDetailUnread: { color: "#C0392B" },
  delete: { fontSize: 13, fontWeight: "600", color: colors.danger, paddingTop: 2 },
});
