import { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppIcon, type AppIconName } from "../components/ui/AppIcon";
import { MainAppHeader } from "../components/navigation/MainAppHeader";
import { StackBrandHeader } from "../components/navigation/StackBrandHeader";
import { NavMenuModal } from "../components/navigation/NavMenuModal";
import { NotificationsPanel } from "../components/navigation/NotificationsPanel";
import { MobileShellProvider } from "../context/MobileShellContext";
import { useResponsive } from "../hooks/useResponsive";
import { useAuthStore } from "../store/authStore";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { AuthScreen } from "../screens/auth/AuthScreen";
import { OtpVerifyScreen } from "../screens/auth/OtpVerifyScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PostRideScreen } from "../screens/PostRideScreen";
import { FindRideScreen } from "../screens/FindRideScreen";
import { RideDetailsScreen } from "../screens/RideDetailsScreen";
import { MyRidesScreen } from "../screens/MyRidesScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const authScreenOptions = { headerShown: false };

type TabIconProps = { focused: boolean; color: string; size: number };

function tabIcon(name: AppIconName) {
  return ({ focused, color, size }: TabIconProps) => (
    <AppIcon name={name} size={size} color={color} style={{ opacity: focused ? 1 : 0.75 }} />
  );
}

const tabBarStyleWide = {
  backgroundColor: colors.surface,
  borderTopColor: colors.border,
  borderTopWidth: 1,
  paddingTop: 6,
  paddingBottom: Platform.OS === "web" ? 8 : 10,
  height: Platform.OS === "web" ? 64 : 68,
} as const;

function MainTabs() {
  const { isWide } = useResponsive();

  return (
    <>
      <Tabs.Navigator
        screenOptions={{
          headerShown: true,
          header: (props) => <MainAppHeader {...props} />,
          title: "",
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: Platform.OS === "ios" ? 0 : 4 },
          tabBarStyle: isWide ? tabBarStyleWide : { display: "none", height: 0 },
        }}
      >
        <Tabs.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: tabIcon("home"),
          }}
        />
        <Tabs.Screen
          name="FindRide"
          component={FindRideScreen}
          options={{
            tabBarLabel: "Find Ride",
            tabBarIcon: tabIcon("search"),
          }}
        />
        <Tabs.Screen
          name="MyRides"
          component={MyRidesScreen}
          options={{
            tabBarLabel: "My Rides",
            tabBarIcon: tabIcon("car"),
          }}
        />
        <Tabs.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: tabIcon("person"),
          }}
        />
      </Tabs.Navigator>
      {!isWide && <NavMenuModal />}
    </>
  );
}

export function AppNavigator() {
  const { user, isAuthReady, authError, authRefreshKey, initAuthListener } = useAuthStore();
  void authRefreshKey;

  useEffect(() => {
    const unsub = initAuthListener();
    return () => unsub();
  }, [initAuthListener]);

  if (!isAuthReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading UniCarpool...</Text>
      </View>
    );
  }

  if (authError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorTitle}>Connection issue</Text>
        <Text style={styles.loadingText}>{authError}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={authScreenOptions} initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (!user.emailVerified) {
    return (
      <Stack.Navigator screenOptions={authScreenOptions}>
        <Stack.Screen name="VerifyEmail" component={OtpVerifyScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <MobileShellProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="PostRide"
          component={PostRideScreen}
          options={{
            headerShown: true,
            header: () => <StackBrandHeader />,
            title: "",
          }}
        />
        <Stack.Screen name="RideDetails" component={RideDetailsScreen} options={{ title: "Ride Details" }} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
      <NotificationsPanel />
    </MobileShellProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  loadingText: { marginTop: 12, color: colors.textMuted, textAlign: "center" },
  errorTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8 },
});
