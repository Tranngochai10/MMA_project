import { BrandPresenceFields } from '../../../components/brand/BrandPresenceFields';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../../../components/common/AppHeader';
import { FormInput } from '../../../components/common/FormInput';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { api } from '../../../services/api';
import { CategoryDto } from '../../../services/apiTypes';
import { useApp } from '../../../context/AppContext';

export default function CreateBrandScreen() {
  const { createManagerBrand } = useApp();
  const [name, setName] = useState('');
  const [salesChannel, setSalesChannel] = useState<'STORE' | 'ONLINE'>('STORE');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<ImagePicker.ImagePickerAsset>();
  const [coverImage, setCoverImage] = useState<ImagePicker.ImagePickerAsset>();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const pickImage = async (field: 'logo' | 'coverImage') => {
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        setError('Mỗi ảnh tối đa 5 MB.');
        return;
      }
      if (asset.mimeType && !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType)) {
        setError('Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
        return;
      }
      if (field === 'logo') setLogo(asset);
      else setCoverImage(asset);
    } catch {
      setError('Không mở được thư viện ảnh. Vui lòng kiểm tra quyền truy cập và thử lại.');
    }
  };

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Vui lòng nhập tên thương hiệu.');
    if (!/^[A-Z0-9]{2}$/.test(code)) return setError('Mã thương hiệu phải gồm đúng 2 chữ cái hoặc chữ số viết hoa.');

    setSubmitting(true);
    try {
      await createManagerBrand({ name: name.trim(), salesChannel, websiteUrl: websiteUrl.trim(), code, categoryId: categoryId || undefined, logo, coverImage, description: description.trim() });
      router.back();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tạo thương hiệu. Vui lòng thử lại.');
    } finally { setSubmitting(false); }
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Tạo thương hiệu" subtitle="Thêm thương hiệu để áp dụng cho voucher" showBack />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Thông tin thương hiệu</Text>
        {(['logo', 'coverImage'] as const).map(field => {
          const asset = field === 'logo' ? logo : coverImage;
          const label = field === 'logo' ? 'Logo' : 'Ảnh bìa';
          return <View key={field} style={{ marginBottom: Spacing.md }}>
            <Text style={styles.label}>{label}</Text>
            {asset && <Image source={{ uri: asset.uri }} style={{ width: field === 'logo' ? 96 : '100%', height: field === 'logo' ? 96 : 160, borderRadius: 12, marginBottom: Spacing.sm }} />}
            <TouchableOpacity accessibilityRole="button" disabled={submitting} onPress={() => void pickImage(field)} style={styles.chip}>
              <Text style={styles.chipText}>{asset ? 'Đổi ảnh' : 'Chọn ảnh từ máy'}</Text>
            </TouchableOpacity>
            {asset && <TouchableOpacity accessibilityRole="button" disabled={submitting} onPress={() => field === 'logo' ? setLogo(undefined) : setCoverImage(undefined)} style={{ paddingTop: Spacing.sm }}><Text style={styles.error}>Xóa ảnh</Text></TouchableOpacity>}
          </View>;
        })}
        <Text style={{ ...Typography.caption, marginBottom: Spacing.md }}>JPG, PNG hoặc WebP, tối đa 5 MB mỗi ảnh.</Text>
        <FormInput label="Tên thương hiệu *" value={name} onChangeText={setName} placeholder="Ví dụ: Highlands Coffee" />
        <FormInput label="Mã thương hiệu * (2 ký tự)" value={code} onChangeText={(value) => setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2))} placeholder="HL" autoCapitalize="characters" maxLength={2} />

        <Text style={styles.label}>Danh mục</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity onPress={() => setCategoryId('')} style={[styles.chip, !categoryId && styles.chipSelected]}><Text style={[styles.chipText, !categoryId && styles.chipTextSelected]}>Chưa chọn</Text></TouchableOpacity>
          {categories.map((category) => <TouchableOpacity key={category._id} onPress={() => setCategoryId(category._id)} style={[styles.chip, categoryId === category._id && styles.chipSelected]}><Text style={[styles.chipText, categoryId === category._id && styles.chipTextSelected]}>{category.name}</Text></TouchableOpacity>)}
        </ScrollView>

        <FormInput label="Mô tả" value={description} onChangeText={setDescription} placeholder="Mô tả ngắn về thương hiệu" multiline numberOfLines={3} />

        <BrandPresenceFields channel={salesChannel} onChannel={setSalesChannel} website={websiteUrl} onWebsite={setWebsiteUrl} />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="Tạo thương hiệu" onPress={submit} loading={submitting} disabled={submitting} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.base, paddingBottom: Spacing.xl },
  sectionTitle: { ...Typography.h3, color: Colors.primaryText, marginBottom: Spacing.md },
  label: { ...Typography.bodySmall, fontWeight: '700', color: Colors.primaryText, marginBottom: Spacing.xs },
  chipRow: { gap: Spacing.xs, paddingBottom: Spacing.md },
  chip: { borderRadius: BorderRadius.card, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.white },
  chipSelected: { backgroundColor: Colors.primaryCoral, borderColor: Colors.primaryCoral },
  chipText: { color: Colors.secondaryText, fontWeight: '600' },
  chipTextSelected: { color: Colors.white },
  error: { color: Colors.error, fontWeight: '600', marginBottom: Spacing.md },
});
