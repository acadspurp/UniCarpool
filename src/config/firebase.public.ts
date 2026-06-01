/**
 * Firebase web client config (public). Used when EXPO_PUBLIC_* env vars are not set at build time.
 * Override locally via `.env` for other projects or emulators.
 */
export const firebasePublicConfig = {
  apiKey: "AIzaSyAOFG8KIQauUWcUSJoVcDJdHsUL7WGktC0",
  authDomain: "unicarpool-f49e4.firebaseapp.com",
  projectId: "unicarpool-f49e4",
  storageBucket: "unicarpool-f49e4.firebasestorage.app",
  messagingSenderId: "128997381785",
  appId: "1:128997381785:web:d2b4f8a74e06fd05e0ca08",
} as const;
