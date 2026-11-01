import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "mma.auth.token";

function browserStorage(): Storage | null {
  return typeof globalThis.localStorage === "undefined" ? null : globalThis.localStorage;
}

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    const storage = browserStorage();
    if (!storage) throw new Error("Không thể truy cập lưu trữ phiên trên trình duyệt.");
    storage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function readAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") return browserStorage()?.getItem(TOKEN_KEY) ?? null;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  if (Platform.OS === "web") {
    browserStorage()?.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
