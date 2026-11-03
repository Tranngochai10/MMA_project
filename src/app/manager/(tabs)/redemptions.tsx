import { QrScannerModal } from '../../../components/common/QrScannerModal';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';

export default function ManagerRedemptionsScreen() {
  const { managerRedemptions, verifyVoucherCode, redeemVoucherCode, notify } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [scanner, setScanner] = useState(false);
  const [scannedToken, setScannedToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultError, setResultError] = useState(false);

  const verify = async (raw = voucherCode) => {
    setScannedToken(raw.startsWith('DLQR:') ? raw : '');
    if (!raw.trim()) { setResultError(true); setResultMessage('Nhập mã voucher cần kiểm tra trước.'); return; }
    setBusy(true);
    setResultMessage('');
    try {
      const result = await verifyVoucherCode(raw.trim());
      if (raw.startsWith('DLQR:')) { setScannedToken(raw); setVoucherCode(String(result.voucherCode || '')); }
      setVerified(result.validityStatus === 'VALID' && !result.isUsed);
      const voucher = result.voucher as Record<string, unknown> | undefined;
      const customer = result.customer as Record<string, unknown> | undefined;
      const message = `${String(result.validityMessage || result.validityStatus || 'Đã kiểm tra mã')}${voucher?.title ? ` · ${String(voucher.title)}` : ''}${customer?.name ? ` · Khách hàng: ${String(customer.name)}` : ''}`;
      setResultError(!(result.validityStatus === 'VALID' && !result.isUsed));
      setResultMessage(message);
      notify(message, result.validityStatus === 'VALID' && !result.isUsed ? 'success' : 'error');
    } catch (error) {
      setVerified(false);
      const message = error instanceof Error ? error.message : 'Không thể xác minh mã. Vui lòng thử lại.';
      setResultError(true); setResultMessage(message); notify(message, 'error');
    } finally { setBusy(false); }
  };

  const redeem = async () => {
    setBusy(true);
    try {
      const result = await redeemVoucherCode(scannedToken || voucherCode.trim());
      setVerified(false);
      setVoucherCode(''); setScannedToken('');
      const message = `Đã xác nhận đổi voucher ${String(result.voucherCode || '')}.`;
      setResultError(false); setResultMessage(message); notify(message);
    } catch (error) { const message = error instanceof Error ? error.message : 'Không thể đổi voucher. Vui lòng thử lại.'; setResultError(true); setResultMessage(message); notify(message, 'error'); }
    finally { setBusy(false); }
  };

  const filteredRedemptions = useMemo(() => {
    if (!searchQuery.trim()) return managerRedemptions;
    const q = searchQuery.toLowerCase();
    return managerRedemptions.filter(
      (r) =>
        r.voucherTitle.toLowerCase().includes(q) ||
        r.voucherCode.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q)
    );
  }, [managerRedemptions, searchQuery]);

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Lịch Sử Sử Dụng Mã"
        subtitle="Nhật ký xác thực mã voucher tại điểm bán"
        showBack={false}
      />

      {/* Prominent Simulation Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Ionicons name="information-circle" size={20} color={Colors.primaryCoral} />
        <View style={styles.disclaimerTexts}>
          <Text style={styles.disclaimerTitle}>Hệ Thống Xác Thực Ưu Đãi</Text>
          <Text style={styles.disclaimerSub}>
            Quét QR từ ví khách hàng, kiểm tra thông tin và xác nhận đổi. Mỗi voucher chỉ sử dụng một lần.
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Tìm mã voucher, tên khách hàng hoặc ưu đãi..."
        showFilterButton={false}
      />

      {scanner && <QrScannerModal onClose={() => setScanner(false)} onScanned={data => { setScanner(false); void verify(data); }} />}
      <View style={styles.verifyBox}>
        <TouchableOpacity onPress={() => { setVerified(false); setScanner(true); }} style={styles.verifyButton}><Ionicons name="qr-code-outline" size={24} color={Colors.white} /></TouchableOpacity>
        <Text style={styles.verifyTitle}>Xác thực mã tại quầy</Text>
        <TextInput value={voucherCode} onChangeText={(value) => { setVoucherCode(value.toUpperCase()); setScannedToken(''); setVerified(false); }} placeholder="Nhập mã voucher" autoCapitalize="characters" style={styles.codeInput} />
        <View style={styles.verifyActions}>
          <TouchableOpacity disabled={busy} onPress={() => verify()} style={styles.verifyButton}><Text style={styles.verifyButtonText}>{busy ? 'Đang kiểm tra…' : 'Kiểm tra mã'}</Text></TouchableOpacity>
          {verified ? <TouchableOpacity disabled={busy} onPress={redeem} style={[styles.verifyButton, styles.redeemButton]}><Text style={styles.verifyButtonText}>Xác nhận đổi</Text></TouchableOpacity> : null}
        </View>
        {resultMessage ? <Text accessibilityRole="alert" style={[styles.resultMessage, resultError ? styles.resultError : styles.resultSuccess]}>{resultMessage}</Text> : null}
      </View>

      <View style={styles.listContainer}>
        {filteredRedemptions.length > 0 ? (
          filteredRedemptions.map((red) => (
            <View key={red.id} style={styles.redemptionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.codeWrap}>
                  <Text style={styles.codeLabel}>Mã Voucher</Text>
                  <Text selectable style={styles.codeValue}>{red.voucherCode}</Text>
                </View>

                <View style={styles.badge}>
                  <Ionicons name="checkmark-done" size={14} color={Colors.primaryDark} />
                  <Text style={styles.badgeText}>ĐÃ SỬ DỤNG</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.voucherTitle}>{red.voucherTitle}</Text>

              <View style={styles.metaRow}>
                <View style={styles.customerCol}>
                  <Ionicons name="person-outline" size={14} color={Colors.secondaryText} />
                  <Text style={styles.customerName}>{red.customerName}</Text>
                </View>
                <View style={styles.dateCol}>
                  <Ionicons name="time-outline" size={14} color={Colors.secondaryText} />
                  <Text style={styles.dateText}>{red.redeemedDate}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="Chưa Có Lượt Sử Dụng"
            message="Các lượt đổi mã voucher của khách hàng sẽ được hiển thị đầy đủ tại đây."
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  verifyBox: { marginHorizontal: Spacing.base, marginBottom: Spacing.md, padding: 20, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,},
  verifyTitle: { ...Typography.body, fontWeight: '700', color: Colors.primaryText, marginBottom: Spacing.sm },
  codeInput: { height: 46, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, color: Colors.primaryText,
    minHeight: 48,
    fontSize: 16,
    backgroundColor: Colors.background,
  },
  verifyActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  verifyButton: { flex: 1, minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryCoral },
  redeemButton: { backgroundColor: Colors.success },
  verifyButtonText: { color: Colors.white, fontWeight: '700' },
  resultMessage: { marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  resultError: { color: Colors.error, backgroundColor: Colors.errorLight },
  resultSuccess: { color: Colors.success, backgroundColor: '#E8F5EE' },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.lightPeach,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerTexts: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  disclaimerTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
  disclaimerSub: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: 18,
  },
  listContainer: {
    paddingHorizontal: Spacing.base,
  },
  redemptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  codeWrap: {},
  codeLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  codeValue: {
    ...Typography.h4,
    color: Colors.primaryCoral,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginLeft: 3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  voucherTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primaryText,
    marginBottom: Spacing.sm,
    fontSize: 16,
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  customerCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primaryText,
    marginLeft: 4,
  },
  dateCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginLeft: 4,
  },
});
