import type { ComponentProps } from "react";
import { Platform, StyleProp, Text, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type AppIconName = ComponentProps<typeof Ionicons>["name"];

/** Reliable symbols on static web hosting when icon fonts fail to load. */
const WEB_GLYPHS: Partial<Record<string, string>> = {
  home: "🏠",
  search: "🔍",
  car: "🚗",
  person: "👤",
  "notifications-outline": "🔔",
  "car-sport": "🚗",
  people: "👥",
  "eye-outline": "👁",
  "eye-off-outline": "🙈",
  "chevron-down": "▼",
  "chevron-up": "▲",
};

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function AppIcon({ name, size = 24, color, style }: Props) {
  if (Platform.OS === "web") {
    const glyph = WEB_GLYPHS[name] ?? "•";
    return (
      <Text
        style={[
          {
            fontSize: size,
            lineHeight: size,
            color,
            textAlign: "center",
            includeFontPadding: false,
          },
          style,
        ]}
      >
        {glyph}
      </Text>
    );
  }

  return <Ionicons name={name} size={size} color={color} style={style} />;
}
