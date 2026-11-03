import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useApp } from '../../context/AppContext';

export default function ManagerLayout() {
  const { isLoggedIn, role, authReady } = useApp();
  const segments = useSegments();
  useEffect(() => {
    if (authReady && (!isLoggedIn || role !== 'MANAGER')) router.replace('/login');
  }, [authReady, isLoggedIn, role, segments]);
  if (!authReady || !isLoggedIn || role !== 'MANAGER') return null;
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="vouchers/create" />
      <Stack.Screen name="brands/create" />
      <Stack.Screen name="vouchers/[id]" />
      <Stack.Screen name="vouchers/[id]/edit" />
    </Stack>
  );
}
