import React from 'react';
import { Stack } from 'expo-router';

export default function ManagerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="vouchers/create" />
      <Stack.Screen name="vouchers/[id]" />
      <Stack.Screen name="vouchers/[id]/edit" />
    </Stack>
  );
}
