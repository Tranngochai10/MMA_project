import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [rating, setRating] = useState('4.8');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Vui lòng nhập tên thương hiệu.');
    if (!/^[A-Z0-9]{2}$/.test(code)) return setError('Mã thương hiệu phải gồm đúng 2 chữ cái hoặc chữ số viết hoa.');
    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) return setError('Điểm đánh giá phải từ 1 đến 5.');

    setSubmitting(true);
    try {
      await createManagerBrand({ name: name.trim(), code, categoryId: categoryId || undefined, rating: numericRating, logo_url: logoUrl.trim(), cover_image_url: coverUrl.trim(), description: description.trim() });
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
        <FormInput label="Tên thương hiệu *" value={name} onChangeText={setName} placeholder="Ví dụ: Highlands Coffee" />
        <FormInput label="Mã thương hiệu * (2 ký tự)" value={code} onChangeText={(value) => setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2))} placeholder="HL" autoCapitalize="characters" maxLength={2} />

        <Text style={styles.label}>Danh mục</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity onPress={() => setCategoryId('')} style={[styles.chip, !categoryId && styles.chipSelected]}><Text style={[styles.chipText, !categoryId && styles.chipTextSelected]}>Chưa chọn</Text></TouchableOpacity>
          {categories.map((category) => <TouchableOpacity key={category._id} onPress={() => setCategoryId(category._id)} style={[styles.chip, categoryId === category._id && styles.chipSelected]}><Text style={[styles.chipText, categoryId === category._id && styles.chipTextSelected]}>{category.name}</Text></TouchableOpacity>)}
        </ScrollView>

        <FormInput label="Mô tả" value={description} onChangeText={setDescription} placeholder="Mô tả ngắn về thương hiệu" multiline numberOfLines={3} />
        <FormInput label="URL logo" value={logoUrl} onChangeText={setLogoUrl} placeholder="https://..." autoCapitalize="none" keyboardType="url" />
        <FormInput label="URL ảnh bìa" value={coverUrl} onChangeText={setCoverUrl} placeholder="https://..." autoCapitalize="none" keyboardType="url" />
        <FormInput label="Đánh giá (1–5)" value={rating} onChangeText={setRating} keyboardType="decimal-pad" />

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
