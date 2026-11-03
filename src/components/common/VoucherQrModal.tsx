import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { api } from '../../services/api';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
export function VoucherQrModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [qr, setQr] = useState<{ qrImage: string; expiresAt: string }>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const { refreshAccountData } = useApp();
  const refresh = useRef(refreshAccountData);
  const close = useRef(onClose);
  useEffect(() => { refresh.current = refreshAccountData; close.current = onClose; }, [refreshAccountData, onClose]);
  const load = async () => {
    setBusy(true); setError('');
    try { setQr(await api.voucherQr(id)); }
    catch (e) { setQr(undefined); setError(e instanceof Error ? e.message : 'Không thể tạo QR.'); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    let active = true;
    api.voucherQr(id).then(data => { if (active) setQr(data); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setBusy(false); });
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(() => { api.walletVoucher(id).then(async item => {
      if (active && item && item.status !== 'AVAILABLE') { active = false; await refresh.current(); close.current(); }
    }).catch(() => { /* Explicit refresh remains available when offline. */ }); }, 5000);
    return () => { active = false; clearInterval(tick); clearInterval(poll); };
  }, [id]);
  const seconds = qr ? Math.max(0, Math.ceil((new Date(qr.expiresAt).getTime() - now) / 1000)) : 0;
  return <Modal transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}><View style={styles.card}>
      <Text style={styles.title}>QR sử dụng voucher</Text>
      <Text style={styles.note}>Đưa mã cho quản lý quét. Voucher chỉ chuyển sang đã dùng sau khi quản lý xác nhận.</Text>
      {busy ? <ActivityIndicator color={Colors.primary} /> : qr && seconds > 0 ? <>
        <Image source={{ uri: qr.qrImage }} style={styles.qr} accessibilityLabel="QR sử dụng voucher" />
        <Text style={styles.note}>Mã còn hiệu lực {seconds} giây.</Text>
      </> : <Text accessibilityRole="alert" style={styles.note}>{error || 'QR đã hết hạn. Tạo mã mới để tiếp tục.'}</Text>}
      {!busy && (!qr || !seconds) && <PrimaryButton title="Tạo lại QR" onPress={load} />}
      <PrimaryButton title="Đóng" onPress={onClose} />
    </View></View>
  </Modal>;
}
const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 24 }, card: { width: '100%', maxWidth: 440, alignSelf: 'center', padding: 24, gap: 16, borderRadius: 24, backgroundColor: Colors.surface }, title: { fontSize: 22, fontWeight: '700', color: Colors.primaryText }, note: { fontSize: 14, lineHeight: 22, color: Colors.secondaryText, textAlign: 'center' }, qr: { width: '100%', aspectRatio: 1, backgroundColor: 'white' } });
