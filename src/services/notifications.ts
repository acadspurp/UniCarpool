import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    return null;
  }

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}
