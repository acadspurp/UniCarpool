import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "./useResponsive";

/** Space so the last fields/buttons clear tab bars, headers, and browser chrome. */
export function useScrollBottomPadding(extra = 0) {
  const insets = useSafeAreaInsets();
  const { isWide } = useResponsive();

  const tabBar = isWide ? 72 : 0;
  const mobileEnd = isWide ? 0 : 28;
  const web = Platform.OS === "web" ? 24 : 0;

  return 40 + insets.bottom + tabBar + mobileEnd + web + extra;
}
