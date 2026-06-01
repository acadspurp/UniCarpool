import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getProfileOnce } from "../../services/profile";
import { Booking } from "../../types/models";
import { colors } from "../../theme/colors";

const SLIDE_DISTANCE = 480;
const OPEN_MS = 280;
const CLOSE_MS = 260;

type LogItem = {
  id: string;
  title: string;
  detail: string;
  sortKey: string;
};

function bookingToLog(booking: Booking, asDriver: boolean, riderName?: string): LogItem {
  const statusLabels: Record<Booking["status"], string> = {
    pending: asDriver ? "New seat request" : "Request sent",
    accepted: asDriver ? "You accepted a rider" : "Request accepted",
    rejected: asDriver ? "Request declined" : "Request declined",
    cancelled: "Booking cancelled",
    completed: "Ride completed",
  };
  const detailLabels: Record<Booking["status"], string> = {
    pending: asDriver
      ? `${riderName || "A rider"} requested a seat on your ride.`
      : "Waiting for the driver to respond.",
    accepted: asDriver
      ? `${riderName || "A rider"} is confirmed for your trip.`
      : "You are confirmed for this carpool.",
    rejected: asDriver
      ? `You declined ${riderName || "a rider"}'s request.`
      : "The driver declined your request.",
    cancelled: "This booking was cancelled.",
    completed: "This trip is marked completed.",
  };
  const ts = booking.updatedAt || booking.createdAt;
  return {
    id: `${asDriver ? "d" : "r"}-${booking.id}`,
    title: statusLabels[booking.status],
    detail: detailLabels[booking.status],
    sortKey: toSortKey(ts),
  };
}

function toSortKey(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "seconds" in value) {
    const sec = (value as { seconds: number }).seconds;
    return new Date(sec * 1000).toISOString();
  }
  return String(value);
}

function mergeLogs(
  rider: Booking[],
  driver: Booking[],
  riderNames: Record<string, string>,
): LogItem[] {
  const items = [
    ...rider.map((b) => bookingToLog(b, false)),
    ...driver.map((b) => bookingToLog(b, true, riderNames[b.riderId])),
  ];
  return items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

export function NotificationsPanel() {
  const { notificationsOpen, closeNotifications, riderBookings, driverBookings } =
    useMobileShell();
  const [riderNames, setRiderNames] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const slideY = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

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
    if (!notificationsOpen) return;
    closingRef.current = false;
    setMounted(true);
    requestAnimationFrame(() => animateOpen());
  }, [notificationsOpen, animateOpen]);

  useEffect(() => {
    const riderIds = [...new Set(driverBookings.map((b) => b.riderId))];
    if (riderIds.length === 0) {
      setRiderNames({});
      return;
    }
    let cancelled = false;
    (async () => {
      const names: Record<string, string> = {};
      await Promise.all(
        riderIds.map(async (uid) => {
          const profile = await getProfileOnce(uid);
          names[uid] = profile?.fullName?.trim() || "Rider";
        }),
      );
      if (!cancelled) setRiderNames(names);
    })();
    return () => {
      cancelled = true;
    };
  }, [driverBookings]);

  const logs = useMemo(
    () => mergeLogs(riderBookings, driverBookings, riderNames),
    [riderBookings, driverBookings, riderNames],
  );

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
            {logs.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔔</Text>
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptyText}>
                  Ride requests and booking updates will appear here when you have activity.
                </Text>
              </View>
            ) : (
              logs.map((item) => (
                <View key={item.id} style={styles.logRow}>
                  <Text style={styles.logTitle}>{item.title}</Text>
                  <Text style={styles.logDetail}>{item.detail}</Text>
                </View>
              ))
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  logDetail: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
