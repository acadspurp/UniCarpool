import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMobileShell } from "../../context/MobileShellContext";
import { useAuthStore } from "../../store/authStore";
import { subscribeMyBookings, subscribeDriverBookings } from "../../services/bookings";
import { Booking } from "../../types/models";
import { colors } from "../../theme/colors";

type LogItem = {
  id: string;
  title: string;
  detail: string;
  sortKey: string;
};

function bookingToLog(booking: Booking, asDriver: boolean): LogItem {
  const statusLabels: Record<Booking["status"], string> = {
    pending: asDriver ? "New seat request" : "Request sent",
    accepted: asDriver ? "You accepted a rider" : "Request accepted",
    rejected: asDriver ? "Request declined" : "Request declined",
    cancelled: "Booking cancelled",
    completed: "Ride completed",
  };
  const detailLabels: Record<Booking["status"], string> = {
    pending: asDriver
      ? "A rider requested a seat on your ride."
      : "Waiting for the driver to respond.",
    accepted: asDriver
      ? "A rider is confirmed for your trip."
      : "You are confirmed for this carpool.",
    rejected: asDriver ? "You declined a seat request." : "The driver declined your request.",
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

function mergeLogs(rider: Booking[], driver: Booking[]): LogItem[] {
  const items = [
    ...rider.map((b) => bookingToLog(b, false)),
    ...driver.map((b) => bookingToLog(b, true)),
  ];
  return items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

export function NotificationsPanel() {
  const { notificationsOpen, closeNotifications } = useMobileShell();
  const { user } = useAuthStore();
  const [riderBookings, setRiderBookings] = useState<Booking[]>([]);
  const [driverBookings, setDriverBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!notificationsOpen || !user) return;
    const unsubRider = subscribeMyBookings(user.uid, setRiderBookings);
    const unsubDriver = subscribeDriverBookings(user.uid, setDriverBookings);
    return () => {
      unsubRider();
      unsubDriver();
    };
  }, [notificationsOpen, user]);

  const logs = useMemo(
    () => mergeLogs(riderBookings, driverBookings),
    [riderBookings, driverBookings],
  );

  return (
    <Modal
      visible={notificationsOpen}
      transparent
      animationType="slide"
      onRequestClose={closeNotifications}
    >
      <Pressable style={styles.backdrop} onPress={closeNotifications}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Notifications</Text>
            <Pressable onPress={closeNotifications} hitSlop={8}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            {logs.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔔</Text>
                <Text style={styles.emptyTitle}>No activity yet</Text>
                <Text style={styles.emptyText}>
                  Ride requests and booking updates will show up here.
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "72%",
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
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
  scroll: { paddingHorizontal: 18, paddingBottom: 24 },
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
