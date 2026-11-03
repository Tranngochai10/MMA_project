import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../context/AppContext';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <CartProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="(user)" />
          <Stack.Screen name="manager" />
        </Stack>
        </CartProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
