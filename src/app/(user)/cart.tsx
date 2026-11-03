import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { api, ApiError } from '../../services/api';
import { Voucher } from '../../types';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { RemoteImage } from '../../components/common/RemoteImage';
import { Colors } from '../../constants/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';

type CartRow = { id: string; voucher?: Voucher; error?: string };
function available(voucher?: Voucher) {
  const now = new Date();
  return !!voucher && voucher.status === 'ACTIVE' && voucher.availableQuantity > 0 && new Date(voucher.startDate) <= now && new Date(voucher.expirationDate) > now;
}
export default function CartScreen() {
  const { ids, ready, error: storageError, removeVoucher } = useCart();
  const { orders, notify } = useApp();
  const [rows, setRows] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const requestVersion = useRef(0);
  const [removing, setRemoving] = useState('');
  const refresh = useCallback(async () => {
    if (!ready) return;
    const version = ++requestVersion.current;
    setLoading(true);
    const result = await Promise.all(ids.map(async id => {
      try { return { id, voucher: await api.voucher(id) }; }
      catch (e) { return { id, error: e instanceof ApiError && e.status === 404 ? 'Voucher đã ngừng bán hoặc không còn tồn tại.' : 'Không thể cập nhật voucher. Vui lòng thử lại.' }; }
    }));
    if (version === requestVersion.current) { setRows(result); setLoading(false); }
  }, [ids, ready]);
  useFocusEffect(useCallback(() => {
    void refresh();
    return () => { requestVersion.current++; };
  }, [refresh]));
  const remove = async (id: string) => {
    if (removing) return;
    setRemoving(id);
    try { await removeVoucher(id); }
    catch (e) { notify(e instanceof Error ? e.message : 'Không thể xóa voucher.', 'error'); }
    finally { setRemoving(''); }
  };
  const checkout = (voucher: Voucher) => {
    const pending = orders.find(order => order.voucherId === voucher.id && order.status === 'PENDING' && order.paymentMethod === 'MB_BANK_TRANSFER');
    router.push({ pathname: '/(user)/checkout', params: { voucherId: voucher.id, ...(pending?.paymentOrderId ? { orderId: pending.paymentOrderId } : {}) } });
  };
  const visibleRows = rows.filter(row => ids.includes(row.id));
  const total = visibleRows.reduce((sum, row) => sum + (available(row.voucher) ? row.voucher!.sellingPrice : 0), 0);
  return <ScreenContainer scrollable><AppHeader title="Giỏ hàng" subtitle={`${ids.length} voucher đã chọn`} showBack showCart={false} />
    <View style={styles.body}>
      {storageError ? <Text accessibilityRole="alert" style={styles.error}>{storageError}</Text> : !ready || loading ? <ActivityIndicator color={Colors.primary} size="large" /> : !ids.length ?
        <EmptyState icon="cart-outline" title="Giỏ hàng đang trống" message="Khám phá voucher và thêm những ưu đãi bạn muốn mua vào giỏ." actionLabel="Khám phá voucher" onAction={() => router.replace('/(user)/(tabs)/discover')} /> : <>
          <View style={styles.summary}><Ionicons name="bag-handle-outline" size={28} color={Colors.primary} /><View style={styles.flex}>
            <Text style={styles.summaryTitle}>{formatCurrency(total)}</Text><Text style={styles.note}>Tổng giá voucher đang khả dụng · Chưa gồm voucher không tải được</Text>
          </View></View>
          <Text style={styles.note}>Chọn thanh toán ở voucher bạn muốn mua. Mỗi voucher có đơn và QR chuyển khoản riêng. Giá, tồn kho được kiểm tra lại khi tạo đơn.</Text>
          {visibleRows.map(row => <View style={styles.card} key={row.id}>
            <View style={styles.row}>
              <RemoteImage uri={row.voucher?.coverImage} fallbackIcon="ticket-outline" style={styles.image} />
              <View style={styles.flex}><Text style={styles.brand}>{row.voucher?.brandName || 'VOUCHER'}</Text><Text style={styles.title}>{row.voucher?.title || 'Voucher không khả dụng'}</Text>
                {row.voucher && <><Text style={styles.price}>{formatCurrency(row.voucher.sellingPrice)}</Text><Text style={styles.note}>Hạn dùng: {formatDate(row.voucher.expirationDate)}</Text></>}
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Xóa ${row.voucher?.title || 'voucher'} khỏi giỏ`} disabled={!!removing} onPress={() => remove(row.id)} style={styles.delete}><Ionicons name="trash-outline" size={21} color={Colors.error} /></TouchableOpacity>
            </View>
            {row.error ? <Text style={styles.error}>{row.error}</Text> : !available(row.voucher) ? <Text style={styles.error}>Voucher chưa mở bán, đã hết hạn hoặc hết lượt.</Text> : null}
            <View style={styles.actions}>
              {row.voucher && <TouchableOpacity accessibilityRole="button" onPress={() => router.push({ pathname: '/(user)/vouchers/[id]', params: { id: row.id } })} style={styles.detail}><Text style={styles.link}>Xem chi tiết</Text></TouchableOpacity>}
              <PrimaryButton title="Thanh toán" disabled={!available(row.voucher) || loading} onPress={() => row.voucher && checkout(row.voucher)} style={styles.flex} />
            </View>
          </View>)}
          <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={() => refresh()} style={styles.detail}><Text style={styles.link}>Cập nhật giá và tình trạng voucher</Text></TouchableOpacity>
          <Text style={styles.note}>Giỏ hàng lưu trên thiết bị này, không giữ chỗ. Voucher chỉ được cấp vào ví sau khi xác nhận nhận tiền.</Text>
        </>}
    </View></ScreenContainer>;
}
const styles = StyleSheet.create({ body: { padding: 20, gap: 18, maxWidth: 760, width: '100%', alignSelf: 'center' }, card: { padding: 18, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 16 }, row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' }, flex: { flex: 1, minWidth: 0 }, image: { width: 72, height: 82, borderRadius: 12 }, brand: { color: Colors.secondaryText, fontSize: 12, fontWeight: '700', marginBottom: 5 }, title: { fontSize: 17, fontWeight: '700', color: Colors.primaryText, marginBottom: 6 }, price: { fontSize: 20, fontWeight: '800', color: Colors.primary }, note: { color: Colors.secondaryText, lineHeight: 21, fontSize: 13 }, delete: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, error: { color: Colors.error, lineHeight: 22 }, actions: { flexDirection: 'row', alignItems: 'center', gap: 16 }, detail: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, link: { fontSize: 14, color: Colors.primary, fontWeight: '600' }, summary: { flexDirection: 'row', gap: 16, padding: 20, borderRadius: 18, backgroundColor: Colors.primary + '0D', alignItems: 'center' }, summaryTitle: { color: Colors.primary, fontSize: 28, fontWeight: '800', marginBottom: 4 } });
