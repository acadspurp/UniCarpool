import { createNavigationContainerRef, CommonActions } from "@react-navigation/native";

export type MainTabName = "Home" | "FindRide" | "MyRides" | "Profile";

export const rootNavigationRef = createNavigationContainerRef();

export function navigateToMainTab(screen: MainTabName) {
  if (!rootNavigationRef.isReady()) return;

  rootNavigationRef.dispatch(
    CommonActions.navigate({
      name: "Main",
      params: { screen },
    }),
  );
}

export function getActiveMainTab(): MainTabName {
  if (!rootNavigationRef.isReady()) return "Home";

  const state = rootNavigationRef.getRootState();
  const mainRoute = state.routes[state.index ?? 0];
  if (mainRoute?.name !== "Main" || !mainRoute.state) return "Home";

  const tabState = mainRoute.state as {
    index?: number;
    routes: { name: string }[];
  };
  const active = tabState.routes[tabState.index ?? 0]?.name;
  if (active === "FindRide" || active === "MyRides" || active === "Profile") return active;
  return "Home";
}
