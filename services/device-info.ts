import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Application from "expo-application";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "montra_device_id";

export interface DeviceInfo {
  device_id: string;
  device_name: string | null;
  latitude: string | null;
  longitude: string | null;
}

let cachedDeviceInfo: DeviceInfo | null = null;

async function generateDeviceId(): Promise<string> {
  try {
    const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existing) return existing;
  } catch {}

  let deviceId: string | null = null;

  try {
    if (Platform.OS === "ios") {
      deviceId = await Application.getIosIdForVendorAsync();
    } else if (Platform.OS === "android") {
      deviceId = Application.getAndroidId();
    }
    if (!deviceId) {
      deviceId = Device.osBuildId;
    }
  } catch {}

  if (!deviceId) {
    const rand = Math.random().toString(36).substring(2, 10);
    const ts = Date.now().toString(36);
    deviceId = `device_${rand}${ts}`;
  }

  try {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  } catch {}

  return deviceId;
}

export async function initDeviceInfo(): Promise<DeviceInfo> {
  if (cachedDeviceInfo) return cachedDeviceInfo;

  const device_id = await generateDeviceId();
  let device_name: string | null = null;
  try { device_name = Device.deviceName ?? null; } catch {}

  let latitude: string | null = null;
  let longitude: string | null = null;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({ accuracy: 1 });
      if (location) {
        latitude = location.coords.latitude.toString();
        longitude = location.coords.longitude.toString();
      }
    }
  } catch {}

  cachedDeviceInfo = { device_id, device_name, latitude, longitude };
  return cachedDeviceInfo;
}

export async function getDeviceInfoHeaders(): Promise<Record<string, string>> {
  const info = cachedDeviceInfo || (await initDeviceInfo());
  return {
    "device-id": info.device_id,
    "device-name": info.device_name ?? "",
    latitude: info.latitude ?? "",
    longitude: info.longitude ?? "",
  };
}

// Eager init — starts collecting device info as soon as the module loads
initDeviceInfo();
