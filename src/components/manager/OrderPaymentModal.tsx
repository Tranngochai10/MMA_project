import React, { useState } from 'react';
import { Modal, ScrollView, Text, View, StyleSheet, Switch } from 'react-native';
import { Order } from '../../types';
import { Colors } from '../../constants/theme';
import { FormInput } from '../common/FormInput';
import { PrimaryButton } from '../common/PrimaryButton';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
export function OrderPaymentModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const { refreshAccountData } = useApp();
  const [transaction, setTransaction] = useState('');
  const [amount, setAmount] = useState('');
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const act = async (cancel = false) => {
    if (busy || !order.paymentOrderId) return;
    setBusy(true); setError('');
    try {
      if (cancel) await api.cancelTransfer(order.paymentOrderId);
      else await api.confirmTransfer(order.paymentOrderId, transaction.trim(), Number(amount));
      await refreshAccountData(); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể cập nhật đơn hàng.'); }
    finally { setBusy(false); }
  };
  const pending = order.status === 'PENDING' && order.paymentMethod === 'MB_BANK_TRANSFER';
  return <Modal animationType="slide" onRequestClose={onClose}><ScrollView contentContainerStyle={styles.body}>
    <Text style={styles.title}>Đối soát đơn hàng</Text><Text selectable style={styles.text}>{order.id}</Text>
    <Text style={styles.text}>{order.voucherTitle}</Text><Text style={styles.title}>{formatCurrency(order.amount)}</Text>
    <Text style={styles.text}>Trạng thái: {order.status}</Text>
    {order.paymentReference ? <Text selectable style={styles.text}>Nội dung chuyển khoản: {order.paymentReference}</Text> : null}
    {pending && <>
      <Text style={styles.text}>Kiểm tra sao kê MB, khớp nội dung chuyển khoản và số tiền trước khi xác nhận. Không dựa vào ảnh biên lai của khách.</Text>
      <FormInput label="Mã giao dịch trên sao kê MB" value={transaction} onChangeText={setTransaction} autoCapitalize="none" />
      <FormInput label="Số tiền thực nhận (VND)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
      <View style={styles.row}><Switch value={checked} onValueChange={setChecked} /><Text style={styles.check}>Tôi đã kiểm tra sao kê ngân hàng cho đơn này.</Text></View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <PrimaryButton title="Đã nhận tiền · Cấp voucher" disabled={busy || !checked || !transaction.trim() || !/^\d+$/.test(amount) || Number(amount) !== order.amount} onPress={() => act()} />
      <PrimaryButton title="Chưa nhận tiền · Hủy đơn và trả tồn kho" disabled={busy || !checked || !!transaction.trim() || !!amount.trim()} onPress={() => act(true)} />
      <Text style={styles.text}>Chỉ hủy khi đã kiểm tra chưa nhận tiền. Đơn đã trả tiền cần xử lý hoàn tiền riêng.</Text>
    </>}
    <PrimaryButton title="Đóng" disabled={busy} onPress={onClose} />
  </ScrollView></Modal>;
}
const styles = StyleSheet.create({ body: { padding: 24, paddingTop: 60, gap: 20, maxWidth: 640, width: '100%', alignSelf: 'center' }, title: { fontSize: 24, fontWeight: '700', color: Colors.primaryText }, text: { fontSize: 15, lineHeight: 24, color: Colors.secondaryText }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, check: { flex: 1, color: Colors.primaryText, lineHeight: 22 }, error: { color: Colors.error } });
