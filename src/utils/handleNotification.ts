import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const schedulePushNotification = async (groupName: string, trigger: number, isRecurrent: boolean) => {
  await Notifications.scheduleNotificationAsync({
    identifier: "review",
    content: {
      title: "Alerta!",
      // subtitle: "It's been a while since you used the app.",
      body: `A data limite para pagamento do grupo ${groupName} é hoje!`
    },
    trigger: {
      seconds: trigger,
      repeats: isRecurrent,
    }
  });
};

export const registerForPushNotificationsAsync = async () => {
  let token: string = "";

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFAABBCC"
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      // alert("Failed to get push token for push notification!");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  return token;
};
