import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../../components/common/FloatingTabBar';

export default function ManagerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Tổng quan',
          tabBarLabel: 'Tổng quan',
        }}
      />
      <Tabs.Screen
        name="vouchers"
        options={{
          title: 'Vouchers',
          tabBarLabel: 'Vouchers',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn hàng',
          tabBarLabel: 'Đơn hàng',
        }}
      />
      <Tabs.Screen
        name="redemptions"
        options={{
          title: 'Đổi mã',
          tabBarLabel: 'Đổi mã',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarLabel: 'Hồ sơ',
        }}
      />
    </Tabs>
  );
}
