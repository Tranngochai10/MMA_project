import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import { api, TransferOrder } from '../../services/api';
import { Voucher } from '../../types';
import { Colors } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

export default function CheckoutScreen() {
  const { voucherId, orderId } = useLocalSearchParams<{ voucherId: string; orderId?: string }>();
  const { isLoggedIn, refreshAccountData, notify } = useApp();
  const { removeVoucher, ready: cartReady } = useCart();
  const [voucher, setVoucher] = useState<Voucher>();
  const [payment, setPayment] = useState<TransferOrder>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const key = useRef('');
  const navigating = useRef(false);
  const refresh = useRef(refreshAccountData);
  useEffect(() => { refresh.current = refreshAccountData; }, [refreshAccountData]);
  useEffect(() => {
    let active = true;
    if (voucherId) api.voucher(voucherId).then(v => { if (active) setVoucher(v); }).catch(e => { if (active) setError(e.message); });
    if (orderId && isLoggedIn) api.transferOrder(orderId).then(p => { if (active) setPayment(p); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [voucherId, orderId, isLoggedIn]);
  useEffect(() => {
    if (payment?.status !== 'PAID' || !cartReady || navigating.current) return;
    navigating.current = true;
    void (async () => {
      try { await removeVoucher(payment.voucherId); }
      catch { notify('Đã thanh toán. Không thể cập nhật giỏ hàng, bạn có thể xóa voucher đã mua khỏi giỏ.', 'info'); }
      await refresh.current();
    })().finally(() => router.replace({ pathname: '/(user)/orders/[id]', params: { id: payment.orderCode } }));
  }, [payment, cartReady, removeVoucher, notify]);
  useEffect(() => {
    if (!payment?.id || payment.status !== 'PENDING') return;
    let active = true;
    const timer = setInterval(() => { api.transferOrder(payment.id).then(p => { if (active) { setPayment(p); setError(''); } }).catch(e => { if (active) setError(e.message); }); }, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [payment?.id, payment?.status]);
  const act = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (payment || orderId) setPayment(await api.transferOrder(payment?.id || orderId!));
      else {
        if (!key.current) {
          const pending = (await api.orders({ status: 'PENDING' })).find(order => order.voucherId === voucherId && order.paymentMethod === 'MB_BANK_TRANSFER' && order._id);
          if (pending?._id) {
            setPayment(await api.transferOrder(pending._id));
            router.setParams({ orderId: pending._id });
            return;
          }
        }
        key.current ||= `mb-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const created = await api.createTransferOrder(voucherId, key.current);
        setPayment(created);
        router.setParams({ orderId: created.id });
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tải thanh toán.'); }
    finally { setBusy(false); }
  };
  return <ScreenContainer scrollable><AppHeader title="Thanh toán chuyển khoản" subtitle="MBBank · VND" showBack />
    <View style={styles.body}>
      <View style={styles.card}><Text style={styles.title}>{voucher?.title || 'Đơn mua voucher'}</Text>
        <Text style={styles.amount}>{payment ? formatCurrency(payment.amount) : voucher ? formatCurrency(voucher.sellingPrice) : 'Đang tải giá…'}</Text>
        <Text style={styles.note}>Giá và nội dung chuyển khoản được xác định từ đơn hàng trên máy chủ.</Text></View>
      {!isLoggedIn ? <PrimaryButton title="Đăng nhập để thanh toán" onPress={() => router.push({ pathname: '/login', params: { returnToVoucherId: voucherId } })} /> : <>
        {payment && <View style={styles.card}>
          <Text style={styles.title}>{payment.status === 'PENDING' ? 'Chờ xác nhận chuyển khoản' : payment.status}</Text>
          <Text selectable style={styles.note}>{payment.orderCode}</Text>
          {payment.canPay && payment.qrImage ? <>
            <Image accessibilityLabel="Mã QR chuyển khoản MB theo giá voucher" source={{ uri: payment.qrImage }} style={styles.qr} />
            <Text style={styles.note}>Mở ứng dụng ngân hàng để quét QR. Kiểm tra tên người nhận trước khi chuyển.</Text>
            <Text selectable style={styles.detail}>MBBank · {payment.bankDetails.accountNumber}</Text>
            <Text selectable style={styles.detail}>{payment.bankDetails.accountName}</Text>
            <Text selectable style={styles.detail}>Nội dung: {payment.paymentReference}</Text>
            <Text style={styles.note}>QR có hiệu lực đến {new Date(payment.expiresAt).toLocaleString('vi-VN')}.</Text>
          </> : payment.status === 'PENDING' ? <Text style={styles.note}>QR đã hết hạn. Không chuyển thêm tiền. Nếu đã chuyển, chờ quản lý đối soát đơn này.</Text> : null}
          <Text style={styles.note}>Sau khi chuyển, quản lý kiểm tra tiền thực nhận rồi xác nhận cấp voucher vào ví. Nút kiểm tra không xác nhận thay ngân hàng.</Text>
        </View>}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {busy && <ActivityIndicator color={Colors.primary} />}
        {(!payment || payment.status === 'PENDING') && <PrimaryButton title={payment ? 'Kiểm tra thanh toán' : 'Tạo đơn và hiện QR MB'} disabled={busy || (!voucher && !payment)} onPress={act} />}
      </>}
    </View></ScreenContainer>;
}
const styles = StyleSheet.create({ body: { padding: 20, gap: 20 }, card: { padding: 20, backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, gap: 12 }, title: { fontSize: 20, fontWeight: '700', color: Colors.primaryText }, amount: { fontSize: 30, fontWeight: '800', color: Colors.primary }, note: { fontSize: 14, color: Colors.secondaryText, lineHeight: 22 }, detail: { fontSize: 16, color: Colors.primaryText, fontWeight: '600' }, qr: { width: '100%', maxWidth: 360, aspectRatio: 1, alignSelf: 'center', backgroundColor: 'white' }, error: { color: Colors.error, lineHeight: 22 } });
