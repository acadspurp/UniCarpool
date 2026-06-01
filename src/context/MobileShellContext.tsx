import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { useBookingActivity } from "../hooks/useBookingActivity";
import { useNotificationInbox } from "../hooks/useNotificationInbox";
import type { NotificationLogItem } from "../utils/notificationLogs";

type MobileShellContextValue = {
  menuOpen: boolean;
  notificationsOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  unreadNotificationCount: number;
  visibleNotifications: NotificationLogItem[];
  markNotificationRead: (ids: string[]) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  isNotificationUnread: (id: string) => boolean;
};

const MobileShellContext = createContext<MobileShellContextValue | null>(null);

export function MobileShellProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { riderBookings, driverBookings } = useBookingActivity();
  const {
    visibleLogs,
    unreadCount,
    markAsRead,
    markAllVisibleAsRead,
    deleteNotification,
    isUnread,
  } = useNotificationInbox(user?.uid, riderBookings, driverBookings);

  const value = useMemo(
    () => ({
      menuOpen,
      notificationsOpen,
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
      openNotifications: () => setNotificationsOpen(true),
      closeNotifications: () => setNotificationsOpen(false),
      unreadNotificationCount: unreadCount,
      visibleNotifications: visibleLogs,
      markNotificationRead: markAsRead,
      markAllNotificationsRead: markAllVisibleAsRead,
      deleteNotification,
      isNotificationUnread: isUnread,
    }),
    [
      menuOpen,
      notificationsOpen,
      unreadCount,
      visibleLogs,
      markAsRead,
      markAllVisibleAsRead,
      deleteNotification,
      isUnread,
    ],
  );

  return <MobileShellContext.Provider value={value}>{children}</MobileShellContext.Provider>;
}

export function useMobileShell() {
  const ctx = useContext(MobileShellContext);
  if (!ctx) {
    throw new Error("useMobileShell must be used within MobileShellProvider");
  }
  return ctx;
}
