import type { LinkingOptions } from "@react-navigation/native";
import { Platform } from "react-native";

function webPrefix() {
  if (typeof window === "undefined") return "https://unicarpool-f49e4.web.app";
  return window.location.origin;
}

/**
 * Maps in-app routes to URL paths so mobile browser Back/Forward
 * navigates inside UniCarpool instead of leaving to the previous site.
 */
export const linking: LinkingOptions<Record<string, object | undefined>> = {
  prefixes: Platform.OS === "web" ? [webPrefix()] : ["unicarpool://"],
  config: {
    screens: {
      Welcome: "welcome",
      Auth: "auth",
      VerifyEmail: "verify",
      Main: {
        screens: {
          Home: "",
          FindRide: "find-ride",
          MyRides: "my-rides",
          Profile: "profile",
        },
      },
      PostRide: "post-ride",
      RideDetails: "ride/:rideId",
      Chat: "chat/:chatId",
    },
  },
};
