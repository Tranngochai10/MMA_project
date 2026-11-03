import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { ManagerStatCard } from '../../../components/manager/ManagerStatCard';
import { Colors, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export default function ManagerDashboardScreen() {
  const { currentUser, managerStats: stats, managerRecentOrders, managerRedemptions } = useApp();
  const utilization = stats.issuedVouchers > 0 ? Math.min(100, Math.round(stats.redeemedVouchers / stats.issuedVouchers * 100)) : 0;
  return <ScreenContainer scrollable>
    <AppHeader title="Tổng quan" subtitle="Không gian quản lý" showNotifications={false} showOrders={false} />
    <View style={styles.welcome}>
      <Text style={styles.eyebrow}>QUẢN TRỊ TOÀN SÀN</Text>
      <Text style={styles.heading}>Hoạt động hệ thống</Text>
      <Text style={styles.intro}>{currentUser.name ? `${currentUser.name} · ` : ''}Theo dõi chiến dịch, đơn hàng và lượt sử dụng voucher.</Text>
      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/manager/vouchers/create')}><Ionicons name="add" size={19} color={Colors.white} /><Text style={styles.createText}>Tạo chiến dịch mới</Text></TouchableOpacity>
    </View>
    <View style={styles.stats}>
      <View style={styles.row}><ManagerStatCard label="Chiến dịch hoạt động" value={stats.activeVouchers} icon="ticket-outline" /><ManagerStatCard label="Đơn hàng" value={stats.totalOrders} icon="receipt-outline" color={Colors.primaryOrange} /></View>
      <View style={styles.row}><ManagerStatCard label="Voucher đã cấp" value={stats.issuedVouchers} icon="wallet-outline" /><ManagerStatCard label="Voucher đã sử dụng" value={stats.redeemedVouchers} icon="checkmark-circle-outline" color={Colors.success} /></View>
      <View style={styles.performance}>
        <Text style={styles.muted}>GIÁ TRỊ ĐƠN MÔ PHỎNG</Text>
        <Text style={styles.amount}>{formatCurrency(stats.totalRevenue)}</Text>
        <View style={styles.progressLabel}><Text style={styles.body}>Tỷ lệ voucher đã sử dụng</Text><Text style={styles.percent}>{utilization}%</Text></View>
        <View style={styles.track}><View style={[styles.fill, { width: `${utilization}%` }]} /></View>
        <Text style={styles.footnote}>{stats.redeemedVouchers} / {stats.issuedVouchers} voucher đã cấp</Text>
      </View>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity style={styles.action} onPress={() => router.push('/manager/brands/create')}><Ionicons name="business-outline" size={20} color={Colors.primaryCoral} /><Text style={styles.actionText}>Thêm thương hiệu</Text><Ionicons name="arrow-forward" size={16} color={Colors.secondaryText} /></TouchableOpacity>
      <TouchableOpacity style={styles.action} onPress={() => router.push('/manager/redemptions')}><Ionicons name="scan-outline" size={20} color={Colors.primaryCoral} /><Text style={styles.actionText}>Kiểm tra & đổi mã</Text><Ionicons name="arrow-forward" size={16} color={Colors.secondaryText} /></TouchableOpacity>
    </View>
    <SectionHeader title="Đơn hàng gần đây" onAction={() => router.push('/manager/orders')} />
    <View style={styles.list}>
      {managerRecentOrders.length === 0 && <Text style={styles.empty}>Chưa có đơn hàng. Các giao dịch sẽ được hiển thị tại đây.</Text>}
      {managerRecentOrders.slice(0, 5).map(order => <View key={order.id} style={styles.listRow}>
        <View style={styles.listIcon}><Ionicons name="receipt-outline" size={19} color={Colors.primaryCoral} /></View>
        <View style={styles.listText}><Text style={styles.listTitle} numberOfLines={1}>{order.voucherTitle}</Text><Text style={styles.footnote}>{formatDate(order.createdAt)} · {order.status}</Text></View>
        <Text style={styles.price}>{formatCurrency(order.amount)}</Text>
      </View>)}
    </View>
    <SectionHeader title="Lượt sử dụng gần đây" onAction={() => router.push('/manager/redemptions')} />
    <View style={styles.list}>
      {managerRedemptions.length === 0 && <Text style={styles.empty}>Chưa có lượt sử dụng voucher.</Text>}
      {managerRedemptions.slice(0, 4).map(item => <View key={item.id} style={styles.listRow}><View style={styles.listIcon}><Ionicons name="checkmark-done-outline" size={19} color={Colors.success} /></View><View style={styles.listText}><Text style={styles.listTitle}>{item.voucherCode}</Text><Text style={styles.footnote}>{item.customerName} · {item.redeemedDate}</Text></View></View>)}
    </View>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  welcome: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24,},
  eyebrow: { color: Colors.primaryCoral, fontSize: 12, letterSpacing: 1, fontWeight: '800', marginBottom: 12 },
  heading: { fontSize: 26, fontWeight: '700', color: Colors.primaryText, letterSpacing: -0.7 },
  intro: { ...Typography.body, color: Colors.secondaryText, marginTop: 10, lineHeight: 22 },
  createButton: { backgroundColor: Colors.primaryCoral, flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 10, marginTop: 22, alignSelf: 'flex-start', alignItems: 'center' },
  createText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  stats: { paddingHorizontal: Spacing.base, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  performance: { backgroundColor: Colors.surface, borderRadius: 14, padding: 20, marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  muted: { color: Colors.secondaryText, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  amount: { color: Colors.primaryText, fontSize: 32, fontWeight: '800', marginTop: 12, marginBottom: 20,},
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  body: { color: Colors.secondaryText, fontSize: 13,},
  percent: { color: Colors.primaryText, fontSize: 13, fontWeight: '800' },
  track: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginVertical: 12, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  footnote: { color: Colors.secondaryText, fontSize: 12, lineHeight: 17, marginTop: 4 },
  actions: { paddingHorizontal: 16, marginTop: 20, gap: 10 },
  action: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 17, gap: 12 },
  actionText: { flex: 1, color: Colors.primaryText, fontWeight: '600', fontSize: 13 },
  list: { marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  listRow: { padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: 12 },
  listIcon: { backgroundColor: Colors.lightPeach, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listText: { flex: 1 },
  listTitle: { fontSize: 13, fontWeight: '700', color: Colors.primaryText },
  price: { fontSize: 13, fontWeight: '800', color: Colors.primaryText },
  empty: { ...Typography.body, color: Colors.secondaryText, padding: 24, lineHeight: 22 },
});
