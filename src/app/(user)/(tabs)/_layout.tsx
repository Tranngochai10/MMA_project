import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../../components/common/FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Khám phá',
          tabBarLabel: 'Khám phá',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Yêu thích',
          tabBarLabel: 'Yêu thích',
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Ví voucher',
          tabBarLabel: 'Ví voucher',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarLabel: 'Tài khoản',
        }}
      />
    </Tabs>
  );
}
