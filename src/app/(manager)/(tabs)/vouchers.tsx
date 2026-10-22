import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import { ManagerVoucherCard } from '../../../components/manager/ManagerVoucherCard';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { Voucher, VoucherStatus } from '../../../types';

type StatusFilter = 'ALL' | VoucherStatus;

export default function ManagerVouchersScreen() {
  const { vouchers, updateVoucherStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedVoucherForAction, setSelectedVoucherForAction] = useState<{
    voucher: Voucher;
    targetStatus: VoucherStatus;
  } | null>(null);

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'ACTIVE', label: 'Đang chạy' },
    { id: 'PAUSED', label: 'Tạm dừng' },
    { id: 'DRAFT', label: 'Bản nháp' },
    { id: 'ENDED', label: 'Đã kết thúc' },
  ];

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (statusFilter !== 'ALL' && v.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(query);
        const matchesBrand = v.brandName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBrand) return false;
      }
      return true;
    });
  }, [vouchers, statusFilter, searchQuery]);

  const handleStatusChangeRequest = (voucher: Voucher, targetStatus: VoucherStatus) => {
    setSelectedVoucherForAction({ voucher, targetStatus });
  };

  const handleConfirmStatusChange = () => {
    if (selectedVoucherForAction) {
      updateVoucherStatus(
        selectedVoucherForAction.voucher.id,
        selectedVoucherForAction.targetStatus
      );
      setSelectedVoucherForAction(null);
    }
  };

  return (
    <ScreenContainer scrollable>
      {/* Header with Create action */}
      <AppHeader
        title="Chiến Dịch Voucher"
        subtitle="Quản lý ưu đãi và phát hành mã giảm giá"
        showBack={false}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(manager)/vouchers/create')}
            style={styles.createBtn}
          >
            <Ionicons name="add" size={18} color={Colors.white} />
            <Text style={styles.createBtnText}>Tạo mới</Text>
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Tìm kiếm tiêu đề voucher hoặc thương hiệu..."
        showFilterButton={false}
      />

      {/* Status Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
          style={{ flexGrow: 0 }}
        >
          {statusTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => setStatusFilter(tab.id)}
              style={[
                styles.tabChip,
                statusFilter === tab.id && styles.tabChipActive,
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  statusFilter === tab.id && styles.tabChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vouchers List */}
      <View style={styles.listContainer}>
        {filteredVouchers.length > 0 ? (
          filteredVouchers.map((v) => (
            <ManagerVoucherCard
              key={v.id}
              voucher={v}
              onPress={() => router.push(`/(manager)/vouchers/${v.id}`)}
              onEdit={() => router.push(`/(manager)/vouchers/${v.id}/edit`)}
              onStatusChange={(targetStatus: VoucherStatus) =>
                handleStatusChangeRequest(v, targetStatus)
              }
            />
          ))
        ) : (
          <EmptyState
            icon="pricetags-outline"
            title="Không tìm thấy voucher"
            message="Không có chiến dịch voucher nào phù hợp với điều kiện tìm kiếm."
            actionLabel="Tạo Chiến Dịch Mới"
            onAction={() => router.push('/(manager)/vouchers/create')}
          />
        )}
      </View>

      {/* Confirmation Dialog for Status Change */}
      {selectedVoucherForAction && (
        <ConfirmDialog
          visible={true}
          title="Xác nhận đổi trạng thái"
          message={`Bạn có chắc chắn muốn chuyển voucher "${selectedVoucherForAction.voucher.title}" sang trạng thái ${selectedVoucherForAction.targetStatus}?`}
          confirmLabel="Xác nhận cập nhật"
          cancelLabel="Hủy bỏ"
          isDestructive={selectedVoucherForAction.targetStatus === 'ENDED'}
          icon={
            selectedVoucherForAction.targetStatus === 'ACTIVE'
              ? 'play-circle-outline'
              : selectedVoucherForAction.targetStatus === 'PAUSED'
              ? 'pause-circle-outline'
              : 'stop-circle-outline'
          }
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setSelectedVoucherForAction(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryCoral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.card,
  },
  createBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 2,
  },
  tabsWrapper: {
    height: 48,
    flexGrow: 0,
    marginBottom: Spacing.xs,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  tabChip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: BorderRadius.card,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabChipActive: {
    backgroundColor: Colors.primaryCoral,
    borderColor: Colors.primaryCoral,
  },
  tabChipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  tabChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: Spacing.base,
  },
});
