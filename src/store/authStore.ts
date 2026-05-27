import { User, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";
import { auth } from "../services/firebase";

type AuthState = {
  user: User | null;
  isAuthReady: boolean;
  authError: string | null;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  initAuthListener: () => () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthReady: false,
  authError: null,
  setUser: (user) => set({ user }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
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
        set({ user, isAuthReady: true, authError: null });
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
