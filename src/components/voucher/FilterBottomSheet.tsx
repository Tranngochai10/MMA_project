import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand, FilterState, VoucherCategory } from '../../types';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { PrimaryButton } from '../common/PrimaryButton';

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  brands: Brand[];
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  brands,
  filters,
  onApplyFilters,
  onClearFilters,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory>(
    filters.category || 'All'
  );
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>(
    filters.brandId
  );
  const [selectedDiscount, setSelectedDiscount] = useState<number | undefined>(
    filters.minDiscount
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | undefined>(
    filters.maxPrice
  );
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(
    filters.onlyAvailable ?? false
  );

  const discountOptions = [
    { label: 'Tất cả mức giảm', value: undefined },
    { label: 'Giảm 30%+', value: 30 },
    { label: 'Giảm 50%+', value: 50 },
    { label: 'Giảm 70%+', value: 70 },
  ];

  const priceOptions = [
    { label: 'Tất cả mức giá', max: undefined },
    { label: 'Dưới $10', max: 10 },
    { label: 'Dưới $25', max: 25 },
    { label: 'Dưới $50', max: 50 },
  ];

  const handleApply = () => {
    onApplyFilters({
      category: selectedCategory,
      brandId: selectedBrandId,
      minDiscount: selectedDiscount,
      maxPrice: selectedPriceRange,
      onlyAvailable,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedCategory('All');
    setSelectedBrandId(undefined);
    setSelectedDiscount(undefined);
    setSelectedPriceRange(undefined);
    setOnlyAvailable(false);
    onClearFilters();
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Bộ lọc voucher</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={24} color={Colors.primaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
                {/* Category Filter */}
                <Text style={styles.sectionTitle}>Danh mục</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedCategory(cat.id)}
                      style={[
                        styles.chip,
                        selectedCategory === cat.id && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedCategory === cat.id && styles.chipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Brands Filter */}
                <Text style={styles.sectionTitle}>Thương hiệu</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSelectedBrandId(undefined)}
                    style={[
                      styles.chip,
                      selectedBrandId === undefined && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedBrandId === undefined && styles.chipTextActive,
                      ]}
                    >
                      Tất cả
                    </Text>
                  </TouchableOpacity>
                  {brands.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedBrandId(b.id)}
                      style={[
                        styles.chip,
                        selectedBrandId === b.id && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedBrandId === b.id && styles.chipTextActive,
                        ]}
                      >
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Minimum Discount */}
                <Text style={styles.sectionTitle}>Mức giảm tối thiểu</Text>
                <View style={styles.optionsWrap}>
                  {discountOptions.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedDiscount(opt.value)}
                      style={[
                        styles.chip,
                        selectedDiscount === opt.value && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedDiscount === opt.value && styles.chipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Maximum Price */}
                <Text style={styles.sectionTitle}>Mức giá tối đa</Text>
                <View style={styles.optionsWrap}>
                  {priceOptions.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedPriceRange(opt.max)}
                      style={[
                        styles.chip,
                        selectedPriceRange === opt.max && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedPriceRange === opt.max && styles.chipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Availability Toggle */}
                <View style={styles.toggleRow}>
                  <Text style={styles.sectionTitleWithoutMargin}>Chỉ hiển thị voucher còn lượt</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setOnlyAvailable(!onlyAvailable)}
                    style={[styles.switchTrack, onlyAvailable && styles.switchTrackActive]}
                  >
                    <View style={[styles.switchThumb, onlyAvailable && styles.switchThumbActive]} />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Footer Actions */}
              <View style={styles.footer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleClear}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearBtnText}>Đặt lại</Text>
                </TouchableOpacity>

                <View style={styles.applyBtnWrapper}>
                  <PrimaryButton title="Áp dụng bộ lọc" onPress={handleApply} />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    maxHeight: '85%',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.primaryText,
  },
  body: {
    paddingVertical: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h4,
    fontSize: 14,
    color: Colors.primaryText,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitleWithoutMargin: {
    ...Typography.h4,
    fontSize: 14,
    color: Colors.primaryText,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.card,
    backgroundColor: Colors.warmCream,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.lightPeach,
    borderColor: Colors.primaryCoral,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.primaryText,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.primaryCoral,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.disabled,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: Colors.primaryCoral,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    ...Shadows.soft,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    marginRight: Spacing.md,
  },
  clearBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  applyBtnWrapper: {
    flex: 1,
  },
});
