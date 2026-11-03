import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const CART_LIMIT = 50;
const keyFor = (owner: string) => `mma.cart.${owner}`;
export async function readCartIds(owner: string): Promise<string[]> {
  const raw = Platform.OS === 'web' ? globalThis.localStorage?.getItem(keyFor(owner)) : await SecureStore.getItemAsync(keyFor(owner));
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)))].slice(0, CART_LIMIT) : [];
  } catch { return []; }
}
export async function writeCartIds(owner: string, ids: string[]): Promise<void> {
  const value = JSON.stringify(ids);
  if (Platform.OS === 'web') {
    if (!globalThis.localStorage) throw new Error('Không thể lưu giỏ hàng trên trình duyệt.');
    globalThis.localStorage.setItem(keyFor(owner), value);
  } else await SecureStore.setItemAsync(keyFor(owner), value);
}
