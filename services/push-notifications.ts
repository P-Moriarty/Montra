import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { DeviceService } from "@/services/modules/device.service";
import { initDeviceInfo } from "@/services/device-info";

const PUSH_TOKEN_KEY = "montra_push_token";

// Configure how notifications are shown when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function storeToken(token: string) {
  try {
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  } catch {}
}

export async function registerForPushNotifications() {
  const deviceInfo = await initDeviceInfo();
  const localDeviceId = deviceInfo.device_id!;

  // Not supported on emulators/simulators
  if (!Device.isDevice) {
    console.log("[Push] Skipping push registration — running on simulator");
    return null;
  }

  // Check if we already have a token stored
  let token = await getStoredToken();

  if (!token) {
    // No stored token — need to request permissions and get one
    let permissionGranted = false;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("[Push] Permission not granted");
        return null;
      }
      permissionGranted = true;
    } catch (e) {
      console.log("[Push] Permission error:", e);
      return null;
    }

    if (!permissionGranted) return null;

    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      token = tokenData.data as string;
    } catch (e) {
      console.log("[Push] Token error:", e);
      return null;
    }

    await storeToken(token);
  }

  if (!token) return null;

  // Fetch devices list to find the backend ID for this device
  try {
    const devicesResponse = await DeviceService.getAll();
    console.log("[Push] Devices response:", JSON.stringify(devicesResponse, null, 2).slice(0, 500));

    // Try multiple possible response shapes
    const devices = devicesResponse?.devices?.devices
      || devicesResponse?.data?.devices
      || devicesResponse?.devices
      || (Array.isArray(devicesResponse) ? devicesResponse : []);

    // Try to find the current device — match by device_id or by id matching the local UUID
    let currentDevice = devices.find((d: any) => d.device_id === localDeviceId)
      || devices.find((d: any) => d.id === localDeviceId)
      || devices[0];

    if (currentDevice?.id) {
      console.log("[Push] Using device ID:", currentDevice.id);
      await DeviceService.updateToken(currentDevice.id, { fcm_token: token });
      console.log("[Push] Token registered with backend");
    } else {
      console.log("[Push] No device found in backend list");
    }
  } catch (e) {
    console.log("[Push] Backend registration error:", e);
  }

  // Android notification channel
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#5154F4",
      });
    } catch {}
  }

  return token;
}
