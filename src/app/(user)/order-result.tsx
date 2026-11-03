import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
export default function OrderResultScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  return <Redirect href={orderId ? { pathname: '/(user)/orders/[id]', params: { id: orderId } } : '/(user)/orders'} />;
}
