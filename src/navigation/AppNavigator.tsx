import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "../store/authStore";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { AuthScreen } from "../screens/auth/AuthScreen";
import { VerifyEmailScreen } from "../screens/auth/VerifyEmailScreen";
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

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 58,
        },
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="FindRide" component={FindRideScreen} options={{ title: "Find Ride" }} />
      <Tabs.Screen name="MyRides" component={MyRidesScreen} options={{ title: "My Rides" }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { user, isAuthReady, authError, authRefreshKey, initAuthListener } = useAuthStore();
  // authRefreshKey ensures navigation updates after email verification reload
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
        <Text style={styles.errorTitle}>Firebase connection issue</Text>
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
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="PostRide" component={PostRideScreen} options={{ title: "Post Ride" }} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} options={{ title: "Ride Details" }} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
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
