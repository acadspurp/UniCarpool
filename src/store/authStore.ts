import { User, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";
import { auth } from "../services/firebase";

type AuthState = {
  user: User | null;
  isAuthReady: boolean;
  authError: string | null;
  authRefreshKey: number;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  initAuthListener: () => () => void;
  /** Reload Firebase user and sync emailVerified into the app. */
  refreshUser: () => Promise<User | null>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthReady: false,
  authError: null,
  authRefreshKey: 0,
  setUser: (user) => set({ user }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  refreshUser: async () => {
    const current = auth.currentUser;
    if (!current) {
      set({ user: null, authRefreshKey: Date.now() });
      return null;
    }
    await current.reload();
    const updated = auth.currentUser;
    set({ user: updated, authRefreshKey: Date.now() });
    return updated;
  },
  initAuthListener: () => {
    const timeout = setTimeout(() => {
      set((state) =>
        state.isAuthReady ? state : { isAuthReady: true, authError: "Auth check timed out" },
      );
    }, 8000);

    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(timeout);
        set({ user, isAuthReady: true, authError: null, authRefreshKey: Date.now() });
      },
      (error) => {
        clearTimeout(timeout);
        console.error("Firebase auth listener error:", error);
        set({ user: null, isAuthReady: true, authError: error.message });
      },
    );

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  },
}));
