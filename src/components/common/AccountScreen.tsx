import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from './ScreenContainer';
import { AppHeader } from './AppHeader';
import { RemoteImage } from './RemoteImage';
import { ConfirmDialog } from './ConfirmDialog';
import { Colors, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

type Item = { label: string; icon: keyof typeof Ionicons.glyphMap; route: Href; count?: number };
export function AccountScreen({ manager = false }: { manager?: boolean }) {
  const { currentUser, isLoggedIn, logout, walletVouchers, orders, brands, managerStats } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const items: Item[] = manager ? [
    { label: 'Tổng quan hoạt động', icon: 'grid-outline', route: '/manager/dashboard' },
    { label: 'Quản lý chiến dịch', icon: 'ticket-outline', route: '/manager/vouchers', count: managerStats.activeVouchers },
    { label: 'Đơn hàng', icon: 'receipt-outline', route: '/manager/orders', count: managerStats.totalOrders },
    { label: 'Kiểm tra & đổi mã', icon: 'scan-outline', route: '/manager/redemptions' },
    { label: 'Thêm thương hiệu', icon: 'business-outline', route: '/manager/brands/create' },
  ] : [
    { label: 'Thông tin cá nhân', icon: 'person-outline', route: '/(user)/edit-profile' },
    { label: 'Ví voucher', icon: 'wallet-outline', route: '/(user)/wallet', count: walletVouchers.length },
    { label: 'Giỏ hàng', icon: 'cart-outline', route: '/(user)/cart' },
    { label: 'Lịch sử đơn hàng', icon: 'receipt-outline', route: '/(user)/orders', count: orders.length },
    { label: 'Ưu đãi yêu thích', icon: 'heart-outline', route: '/(user)/favorites' },
    { label: 'Thông báo', icon: 'notifications-outline', route: '/(user)/notifications' },
  ];
  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    setConfirm(false);
    try { await logout(); router.replace('/login'); }
    catch { Alert.alert('Không đăng xuất được', 'Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  return <ScreenContainer scrollable>
    <AppHeader title="Tài khoản" subtitle={manager ? 'Không gian quản trị' : 'Mọi ưu đãi, theo cách của bạn'} showNotifications={false} showOrders={false} />
    <View style={styles.identity}>
      <RemoteImage uri={currentUser.avatarUrl} fallbackIcon="person-outline" style={styles.avatar} />
      <Text style={styles.name}>{currentUser.name || 'Chào bạn'}</Text>
      {!!currentUser.email && <Text style={styles.email}>{currentUser.email}</Text>}
      <View style={styles.badge}><Text style={styles.badgeText}>{manager ? 'Quản trị toàn sàn' : isLoggedIn ? 'Tài khoản khách hàng' : 'Khách ghé thăm'}</Text></View>
    </View>
    {!isLoggedIn ? <TouchableOpacity style={styles.login} onPress={() => router.push('/login')}><Text style={styles.loginText}>Đăng nhập để lưu ưu đãi</Text><Ionicons name="arrow-forward" color={Colors.white} size={18} /></TouchableOpacity> : <>
      <View style={styles.summary}>
        <View style={styles.metric}><Text style={styles.number}>{manager ? brands.length : walletVouchers.filter(v => v.status === 'AVAILABLE').length}</Text><Text style={styles.caption}>{manager ? 'Thương hiệu' : 'Voucher khả dụng'}</Text></View>
        <View style={styles.separator} />
        <View style={styles.metric}><Text style={styles.number}>{manager ? managerStats.totalOrders : orders.length}</Text><Text style={styles.caption}>Đơn hàng</Text></View>
      </View>
      <Text style={styles.sectionLabel}>{manager ? 'QUẢN LÝ' : 'CÁ NHÂN'}</Text>
      <View style={styles.menu}>{items.map(item => <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => router.push(item.route)} accessibilityRole="button">
        <View style={styles.icon}><Ionicons name={item.icon} size={20} color={Colors.primaryCoral} /></View>
        <Text style={styles.label}>{item.label}</Text>
        {item.count !== undefined && <Text style={styles.count}>{item.count}</Text>}
        <Ionicons name="chevron-forward" size={16} color={Colors.tertiaryText} />
      </TouchableOpacity>)}</View>
      <TouchableOpacity disabled={busy} style={styles.logout} onPress={() => setConfirm(true)}><Ionicons name="log-out-outline" size={20} color={Colors.error} /><Text style={styles.logoutText}>{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</Text></TouchableOpacity>
    </>}
    <ConfirmDialog visible={confirm} title="Đăng xuất?" message="Bạn có thể đăng nhập lại để tiếp tục sử dụng voucher đã lưu." confirmLabel="Đăng xuất" cancelLabel="Ở lại" onConfirm={() => void signOut()} onCancel={() => setConfirm(false)} isDestructive />
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  identity: { alignItems: 'center', paddingTop: 28, paddingBottom: 26, paddingHorizontal: 24 },
  avatar: { width: 84, height: 84, borderRadius: 16, marginBottom: 18 },
  name: { fontSize: 25, fontWeight: '800', color: Colors.primaryText, textAlign: 'center' },
  email: { ...Typography.body, color: Colors.secondaryText, marginTop: 8 },
  badge: { backgroundColor: Colors.lightPeach, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7, marginTop: 14 },
  badgeText: { color: Colors.primaryCoral, fontSize: 12, fontWeight: '700' },
  summary: { marginHorizontal: 20, padding: 24, borderRadius: 16, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center' },
  metric: { flex: 1, alignItems: 'center' },
  number: { color: Colors.primaryText, fontSize: 28, fontWeight: '800' },
  caption: { color: Colors.secondaryText, fontSize: 12, marginTop: 5 },
  separator: { width: 1, height: 36, backgroundColor: Colors.border },
  sectionLabel: { marginHorizontal: 24, marginTop: 30, marginBottom: 12, color: Colors.secondaryText, fontSize: 12, letterSpacing: 1.8, fontWeight: '700' },
  menu: { marginHorizontal: 20, backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  icon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.lightPeach, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.primaryText },
  count: { color: Colors.secondaryText, fontSize: 12, marginRight: 4 },
  logout: { margin: 20, padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  logoutText: { color: Colors.error, fontWeight: '600', fontSize: 13 },
  login: { margin: 24, padding: 18, borderRadius: 16, backgroundColor: Colors.primaryCoral, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  loginText: { color: Colors.white, fontWeight: '700' },
});
