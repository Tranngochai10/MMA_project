import React from 'react';
import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Primary 5 Tabs Container */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Detail, Action, and Sub-screens (Stack Navigation) */}
      <Stack.Screen name="brands" />
      <Stack.Screen name="brands/[id]" />
      <Stack.Screen name="vouchers/[id]" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order-result" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="wallet/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="edit-profile" />
    </Stack>
  );
}
