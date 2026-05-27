import { User, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";
import { auth } from "../services/firebase";

type AuthState = {
  user: User | null;
  isAuthReady: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  initAuthListener: () => () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthReady: false,
  setUser: (user) => set({ user }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  initAuthListener: () =>
    onAuthStateChanged(auth, (user) => {
      set({ user, isAuthReady: true });
    }),
}));
