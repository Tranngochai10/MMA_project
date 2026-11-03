import { DateField } from '../../../../components/common/DateField';
import React, { useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../../components/common/ScreenContainer';
import { AppHeader } from '../../../../components/common/AppHeader';
import { FormInput } from '../../../../components/common/FormInput';
import { PrimaryButton } from '../../../../components/common/PrimaryButton';
import { SecondaryButton } from '../../../../components/common/SecondaryButton';
import { EmptyState } from '../../../../components/common/EmptyState';
import { Colors, Shadows, Spacing, Typography } from '../../../../constants/theme';
import { useApp } from '../../../../context/AppContext';
import { api } from '../../../../services/api';
import { RemoteImage } from '../../../../components/common/RemoteImage';

export default function EditVoucherScreen() {
  const { id } = useLocalSearchParams();
  const { getVoucherById, updateVoucher } = useApp();

  const voucher = getVoucherById(id as string);

  const [title, setTitle] = useState(voucher?.title || '');
  const [description, setDescription] = useState(voucher?.description || '');
  const [sellingPrice, setSellingPrice] = useState(String(voucher?.sellingPrice || ''));
  const [originalValue, setOriginalValue] = useState(String(voucher?.originalValue || ''));
  const [totalQuantity, setTotalQuantity] = useState(String(voucher?.totalQuantity || ''));
  const [expirationDate, setExpirationDate] = useState(voucher?.expirationDate || '');
  const [conditionsText, setConditionsText] = useState(
    voucher?.usageConditions.join('\n') || ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverImage, setCoverImage] = useState(voucher?.coverImage || '');
  const [coverAsset, setCoverAsset] = useState<ImagePicker.ImagePickerAsset>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const saveLock = useRef(false);

  const chooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) throw new Error('Mỗi ảnh tối đa 5 MB.');
      if (asset.mimeType && !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType)) throw new Error('Chọn ảnh JPG, PNG hoặc WebP.');
      setCoverAsset(asset);
      setCoverImage(asset.uri);
      setSaveError('');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Không chọn được ảnh.');
    }
  };

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

  const handleSave = async () => {
    if (saveLock.current || !validate()) return;
    saveLock.current = true;
    setSaving(true);
    setSaveError('');
    try {
      const savedCover = coverAsset ? (await api.uploadImage(coverAsset)).url : coverImage;
      if (coverAsset) { setCoverImage(savedCover); setCoverAsset(undefined); }
      await updateVoucher(id as string, { title: title.trim(), description: description.trim(), sellingPrice: Number(sellingPrice), originalValue: Number(originalValue), totalQuantity: Number(totalQuantity), expirationDate, coverImage: savedCover, usageConditions: conditionsText.split('\n').map((line) => line.trim()).filter(Boolean) });
      router.back();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Không lưu được voucher.');
    } finally { setSaving(false); saveLock.current = false; }
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Chỉnh Sửa Voucher" subtitle={`Cập nhật ${voucher.title}`} showBack />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông Tin Voucher</Text>
          <Text style={{ ...Typography.body, marginBottom: Spacing.sm }}>Ảnh voucher</Text>
          <RemoteImage uri={coverImage} style={{ width: '100%', height: 190, borderRadius: 16 }} />
          <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={() => void chooseImage()} style={{ paddingVertical: 16 }}>
            <Text style={{ color: Colors.primaryCoral, fontWeight: '700' }}>{coverImage ? 'Đổi ảnh voucher' : 'Chọn ảnh từ máy'}</Text>
          </TouchableOpacity>
          <Text style={{ ...Typography.caption, marginBottom: Spacing.base }}>JPG, PNG hoặc WebP · tối đa 5 MB. Ảnh được lưu khi bạn bấm Lưu thay đổi.</Text>

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
                label="Giá bán ưu đãi (VND) *"
                value={sellingPrice}
                onChangeText={setSellingPrice}
                keyboardType="numeric"
                error={errors.sellingPrice}
              />
            </View>
            <View style={[styles.flexOne, { marginLeft: Spacing.sm }]}>
              <FormInput
                label="Giá gốc (VND) *"
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
              <DateField
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
          loading={saving}
          style={styles.saveBtn}
        />
        {!!saveError && <Text accessibilityRole="alert" style={{ color: Colors.error, marginTop: Spacing.md }}>{saveError}</Text>}

        <SecondaryButton
          title="Hủy Bỏ"
          onPress={() => router.back()}
          style={styles.cancelBtn}
        />
      </View>

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
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    ...Shadows.card,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  rowTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  flexOne: {
    flex: 1,
    minWidth: 130,
  },
  saveBtn: {
    marginBottom: Spacing.sm,
  },
  cancelBtn: {},
});
