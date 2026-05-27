import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "../store/authStore";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignupScreen } from "../screens/auth/SignupScreen";
import { VerifyEmailScreen } from "../screens/auth/VerifyEmailScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PostRideScreen } from "../screens/PostRideScreen";
import { FindRideScreen } from "../screens/FindRideScreen";
import { RideDetailsScreen } from "../screens/RideDetailsScreen";
import { MyRidesScreen } from "../screens/MyRidesScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="FindRide" component={FindRideScreen} options={{ title: "Find Ride" }} />
      <Tabs.Screen name="MyRides" component={MyRidesScreen} options={{ title: "My Rides" }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { user, isAuthReady, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsub = initAuthListener();
    return () => unsub();
  }, [initAuthListener]);

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  if (!user.emailVerified) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{ title: "Verify Campus Email" }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="PostRide" component={PostRideScreen} options={{ title: "Post Ride" }} />
      <Stack.Screen
        name="RideDetails"
        component={RideDetailsScreen}
        options={{ title: "Ride Details" }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
