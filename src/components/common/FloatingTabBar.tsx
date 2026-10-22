import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface FloatingTabBarProps {
  state: any;
  descriptors: any;
  navigation?: any;
  navigateToTab?: (routeKey: string) => void;
  [key: string]: any;
}

const TAB_DEFINITIONS: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }
> = {
  // User Tabs
  home: { label: 'Trang chủ', icon: 'home-outline', activeIcon: 'home' },
  discover: { label: 'Khám phá', icon: 'compass-outline', activeIcon: 'compass' },
  favorites: { label: 'Yêu thích', icon: 'heart-outline', activeIcon: 'heart' },
  wallet: { label: 'Ví voucher', icon: 'wallet-outline', activeIcon: 'wallet' },
  profile: { label: 'Tài khoản', icon: 'person-outline', activeIcon: 'person' },

  // Manager Tabs
  dashboard: { label: 'Tổng quan', icon: 'grid-outline', activeIcon: 'grid' },
  vouchers: { label: 'Vouchers', icon: 'ticket-outline', activeIcon: 'ticket' },
  orders: { label: 'Đơn hàng', icon: 'cart-outline', activeIcon: 'cart' },
  redemptions: { label: 'Đổi mã', icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle' },
};

export const FloatingTabBar: React.FC<FloatingTabBarProps> = (props) => {
  const { state, descriptors, navigation, navigateToTab } = props;
  const insets = useSafeAreaInsets();

  // Filter out any nested stack routes or hidden screens
  const validRoutes = state.routes.filter((route: any) => {
    const descriptor = descriptors[route.key];
    const options = descriptor?.options;
    if (options?.href === null) return false;
    return Boolean(TAB_DEFINITIONS[route.name]);
  });

  return (
    <View style={[styles.floatingWrapper, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.container}>
        {validRoutes.map((route: any) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options;
          const isFocused = state.routes[state.index]?.key === route.key;

          const tabConfig = TAB_DEFINITIONS[route.name] || {
            label: route.name,
            icon: 'ellipse-outline',
            activeIcon: 'ellipse',
          };

          const onPress = () => {
            if (navigation?.emit) {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (event.defaultPrevented) return;
            }

            if (!isFocused) {
              if (navigateToTab) {
                navigateToTab(route.key);
              } else if (navigation?.navigate) {
                navigation.navigate(route.name);
              } else {
                router.navigate(route.name as any);
              }
            }
          };

          const iconName = isFocused ? tabConfig.activeIcon : tabConfig.icon;
          const label = options?.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options?.title !== undefined
            ? options.title
            : tabConfig.label;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemFocused,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerFocused,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={20}
                  color={isFocused ? Colors.primaryCoral : Colors.secondaryText}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? Colors.primaryCoral : Colors.secondaryText },
                  isFocused && styles.tabLabelFocused,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.tabBar,
    justifyContent: 'space-around',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: BorderRadius.card,
  },
  tabItemFocused: {
    backgroundColor: Colors.lightPeach,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
});
