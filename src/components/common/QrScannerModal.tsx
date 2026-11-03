import React, { useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { PrimaryButton } from './PrimaryButton';
import { Colors } from '../../constants/theme';
export function QrScannerModal({ onScanned, onClose }: { onScanned: (data: string) => void; onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState('');
  const scanned = useRef(false);
  return <Modal animationType="slide" onRequestClose={onClose}><View style={styles.body}>
    <Text style={styles.title}>Quét QR voucher</Text>
    <Text style={styles.note}>Quét mã để kiểm tra, sau đó xác nhận đổi voucher.</Text>
    {permission?.granted ? <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onMountError={e => setError(e.message)} onBarcodeScanned={({ data }) => {
      if (scanned.current) return;
      if (!data.startsWith('DLQR:')) { setError('Đây không phải QR sử dụng voucher.'); return; }
      scanned.current = true; onScanned(data);
    }} /> : <PrimaryButton title="Cho phép sử dụng camera" onPress={() => { requestPermission().catch(e => setError(e.message)); }} />}
    {error ? <Text accessibilityRole="alert" style={styles.note}>{error}</Text> : null}
    <PrimaryButton title="Đóng camera" onPress={onClose} />
  </View></Modal>;
}
const styles = StyleSheet.create({ body: { flex: 1, padding: 24, paddingTop: 60, gap: 20, backgroundColor: Colors.background }, title: { fontSize: 24, fontWeight: '700', color: Colors.primaryText }, note: { color: Colors.secondaryText, lineHeight: 22 }, camera: { flex: 1, borderRadius: 20, overflow: 'hidden' } });
