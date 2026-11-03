import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { RemoteImage } from '../../../components/common/RemoteImage';
import { EmptyState } from '../../../components/common/EmptyState';
import { BrandCard } from '../../../components/brand/BrandCard';
import { VoucherGrid } from '../../../components/voucher/VoucherGrid';
import { Colors, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { formatCurrency } from '../../../utils/formatters';

export default function HomeScreen() {
  const { brands, vouchers, toggleFavoriteVoucher } = useApp();
  const [query, setQuery] = useState('');
  const available = vouchers.filter(v => v.status === 'ACTIVE' && v.availableQuantity > 0 && new Date(v.expirationDate) > new Date());
  const bySavings = [...available].sort((a, b) => (b.originalValue - b.sellingPrice) - (a.originalValue - a.sellingPrice));
  const hero = bySavings[0];
  const categories = Array.from(new Set(available.map(v => v.category))).filter(category => category !== 'All');
  const featuredBrands = brands.filter(brand => available.some(v => v.brandId === brand.id));
  const featuredIds = new Set(bySavings.slice(0, 6).map(v => v.id));
  const expiring = available.filter(v => !featuredIds.has(v.id)).sort((a, b) => Date.parse(a.expirationDate) - Date.parse(b.expirationDate)).slice(0, 4);
  const explore = () => router.push({ pathname: '/(user)/discover', params: { q: query.trim() } });

  return <ScreenContainer scrollable>
    <AppHeader showUserGreeting showNotifications showOrders />
    <View style={styles.intro}>
      <Text style={styles.eyebrow}>DEALORA</Text>
      <Text style={styles.heading}>Khám phá voucher</Text>
      <Text style={styles.subtitle}>{available.length ? `${available.length} voucher đang có sẵn từ ${featuredBrands.length} thương hiệu.` : 'Khám phá các chương trình từ thương hiệu bạn yêu thích.'}</Text>
    </View>
    <SearchBar value={query} onChangeText={setQuery} onSubmitEditing={explore} onFilterPress={() => router.push('/(user)/discover')} placeholder="Bạn đang tìm ưu đãi gì?" />

    {hero && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Xem ${hero.title}`} onPress={() => router.push(`/(user)/vouchers/${hero.id}`)} activeOpacity={0.9} style={styles.hero}>
      <View style={styles.heroContent}>
        <View style={styles.heroTag}><Ionicons name="sparkles-outline" size={12} color={Colors.primaryDark} /><Text style={styles.heroTagText}>LỰA CHỌN TIẾT KIỆM</Text></View>
        <Text style={styles.heroBrand}>{hero.brandName}</Text>
        <Text style={styles.heroTitle} numberOfLines={3}>{hero.title}</Text>
        <Text style={styles.heroPrice}>{formatCurrency(hero.sellingPrice)}</Text>
        <View style={styles.heroAction}><Text style={styles.heroActionText}>Xem ưu đãi</Text><Ionicons name="arrow-forward" size={16} color={Colors.primary} /></View>
      </View>
      <RemoteImage uri={hero.coverImage} style={styles.heroImage} />
    </TouchableOpacity>}

    {categories.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
      {categories.map(category => <TouchableOpacity key={category} onPress={() => router.push({ pathname: '/(user)/discover', params: { category } })} style={styles.chip}><Text style={styles.chipText}>{category}</Text><Ionicons name="arrow-forward" size={13} color={Colors.primaryCoral} /></TouchableOpacity>)}
    </ScrollView>}

    {featuredBrands.length > 0 && <>
      <SectionHeader title="Thương hiệu có ưu đãi" subtitle="Tìm một điểm đến quen thuộc" onAction={() => router.push('/(user)/brands')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>
        {featuredBrands.map(brand => <BrandCard key={brand.id} brand={brand} variant="circle" onPress={() => router.push(`/(user)/brands/${brand.id}`)} />)}
      </ScrollView>
    </>}

    <SectionHeader title="Đáng để khám phá" subtitle="Sắp xếp theo số tiền tiết kiệm" onAction={available.length ? explore : undefined} />
    {available.length ? <VoucherGrid vouchers={bySavings.slice(0, 6)} onVoucherPress={v => router.push(`/(user)/vouchers/${v.id}`)} onFavoritePress={toggleFavoriteVoucher} />
      : <EmptyState icon="ticket-outline" title="Chưa có ưu đãi khả dụng" message="Các voucher đang mở bán sẽ xuất hiện tại đây khi thương hiệu cập nhật." />}

    {expiring.length > 0 && <>
      <SectionHeader title="Đừng bỏ lỡ" subtitle="Các voucher có hạn sử dụng gần nhất" onAction={explore} />
      <VoucherGrid vouchers={expiring} onVoucherPress={v => router.push(`/(user)/vouchers/${v.id}`)} onFavoritePress={toggleFavoriteVoucher} />
    </>}
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  intro: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20,},
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: Colors.primaryCoral, marginBottom: 8,},
  heading: { fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: -0.4, color: Colors.primaryText },
  subtitle: { ...Typography.body, color: Colors.secondaryText, marginTop: 12, lineHeight: 22 },
  hero: { margin: Spacing.base, marginTop: 8, borderRadius: 16, backgroundColor: Colors.primaryLight, flexDirection: 'row', overflow: 'hidden', minHeight: 204,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroContent: { flex: 1.3, padding: 20, justifyContent: 'center', alignItems: 'flex-start' },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12,},
  heroTagText: { color: Colors.primaryDark, fontSize: 12, fontWeight: '700', letterSpacing: 0.5,},
  heroBrand: { color: Colors.secondaryText, fontSize: 12, marginBottom: 6 },
  heroTitle: { color: Colors.primaryText, fontSize: 19, lineHeight: 26, fontWeight: '700' },
  heroPrice: { color: Colors.primary, fontSize: 24, fontWeight: '800', marginTop: 10,},
  heroAction: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12,},
  heroActionText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  heroImage: { width: '34%', height: '100%', minHeight: 204, resizeMode: 'cover' },
  categories: { paddingHorizontal: Spacing.base, gap: 8, paddingVertical: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  chipText: { color: Colors.primaryText, fontSize: 12, fontWeight: '600' },
  brandList: { paddingHorizontal: Spacing.base, paddingBottom: 8 },
});
