import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../../components/common/ScreenContainer';
import { AppHeader } from '../../../../components/common/AppHeader';
import { FormInput } from '../../../../components/common/FormInput';
import { PrimaryButton } from '../../../../components/common/PrimaryButton';
import { SecondaryButton } from '../../../../components/common/SecondaryButton';
import { SuccessModal } from '../../../../components/common/SuccessModal';
import { EmptyState } from '../../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../../constants/theme';
import { useApp } from '../../../../context/AppContext';

export default function EditVoucherScreen() {
  const { id } = useLocalSearchParams();
  const { getVoucherById, updateVoucher } = useApp();

  const voucher = getVoucherById(id as string);

  if (!voucher) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="alert-circle-outline"
          title="Campaign Not Found"
          message="Could not locate voucher campaign to edit."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const [title, setTitle] = useState(voucher.title);
  const [description, setDescription] = useState(voucher.description);
  const [sellingPrice, setSellingPrice] = useState(String(voucher.sellingPrice));
  const [originalValue, setOriginalValue] = useState(String(voucher.originalValue));
  const [totalQuantity, setTotalQuantity] = useState(String(voucher.totalQuantity));
  const [expirationDate, setExpirationDate] = useState(voucher.expirationDate);
  const [conditionsText, setConditionsText] = useState(
    voucher.usageConditions.join('\n')
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
    if (isNaN(Number(sellingPrice)) || Number(sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Vui lòng nhập giá bán hợp lệ';
    }
    if (isNaN(Number(originalValue)) || Number(originalValue) <= 0) {
      newErrors.originalValue = 'Vui lòng nhập giá gốc hợp lệ';
    }
    if (isNaN(Number(totalQuantity)) || Number(totalQuantity) <= 0) {
      newErrors.totalQuantity = 'Vui lòng nhập số lượng hợp lệ';
    }
    if (!expirationDate.trim()) newErrors.expirationDate = 'Vui lòng nhập ngày hết hạn';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const conditionsList = conditionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      updateVoucher(voucher.id, {
        title,
        description,
        sellingPrice: Number(sellingPrice),
        originalValue: Number(originalValue),
        totalQuantity: Number(totalQuantity),
        expirationDate,
        usageConditions: conditionsList,
      });

      setShowSuccessModal(true);
    }, 600);
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Chỉnh Sửa Voucher" subtitle={`Cập nhật ${voucher.title}`} showBack />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông Tin Voucher</Text>

          <FormInput
            label="Tiêu đề *"
            value={title}
            onChangeText={(txt: string) => {
              setTitle(txt);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            error={errors.title}
          />

          <FormInput
            label="Mô tả *"
            value={description}
            onChangeText={(txt: string) => {
              setDescription(txt);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            multiline
            numberOfLines={3}
            error={errors.description}
          />

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <FormInput
                label="Giá bán ưu đãi ($) *"
                value={sellingPrice}
                onChangeText={setSellingPrice}
                keyboardType="numeric"
                error={errors.sellingPrice}
              />
            </View>
            <View style={[styles.flexOne, { marginLeft: Spacing.sm }]}>
              <FormInput
                label="Giá gốc ($) *"
                value={originalValue}
                onChangeText={setOriginalValue}
                keyboardType="numeric"
                error={errors.originalValue}
              />
            </View>
          </View>

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <FormInput
                label="Tổng số lượng *"
                value={totalQuantity}
                onChangeText={setTotalQuantity}
                keyboardType="numeric"
                error={errors.totalQuantity}
              />
            </View>
            <View style={[styles.flexOne, { marginLeft: Spacing.sm }]}>
              <FormInput
                label="Ngày hết hạn *"
                value={expirationDate}
                onChangeText={setExpirationDate}
                error={errors.expirationDate}
              />
            </View>
          </View>

          <FormInput
            label="Điều kiện áp dụng (Mỗi dòng 1 điều kiện)"
            value={conditionsText}
            onChangeText={setConditionsText}
            multiline
            numberOfLines={4}
          />
        </View>

        <PrimaryButton
          title="Lưu Thay Đổi"
          onPress={handleSave}
          loading={loading}
          style={styles.saveBtn}
        />

        <SecondaryButton
          title="Hủy Bỏ"
          onPress={() => router.back()}
          style={styles.cancelBtn}
        />
      </View>

      <SuccessModal
        visible={showSuccessModal}
        title="Đã Lưu Thay Đổi! ✨"
        message="Thông tin chiến dịch voucher đã được cập nhật thành công."
        buttonLabel="Quay Lại Chi Tiết"
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginBottom: Spacing.md,
  },
  rowTwo: {
    flexDirection: 'row',
  },
  flexOne: {
    flex: 1,
  },
  saveBtn: {
    marginBottom: Spacing.sm,
  },
  cancelBtn: {},
});
