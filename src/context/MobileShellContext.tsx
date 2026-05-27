import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type MobileShellContextValue = {
  menuOpen: boolean;
  notificationsOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
};

const MobileShellContext = createContext<MobileShellContextValue | null>(null);

export function MobileShellProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const value = useMemo(
    () => ({
      menuOpen,
      notificationsOpen,
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
      openNotifications: () => setNotificationsOpen(true),
      closeNotifications: () => setNotificationsOpen(false),
    }),
    [menuOpen, notificationsOpen],
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
