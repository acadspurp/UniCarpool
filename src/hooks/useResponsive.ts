import { useWindowDimensions } from "react-native";

const TABLET_BREAKPOINT = 768;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWide = width >= TABLET_BREAKPOINT;
  const isCompact = width < 400;
  const contentMaxWidth = isWide ? 480 : width;

  return { width, height, isWide, isCompact, contentMaxWidth };
}
