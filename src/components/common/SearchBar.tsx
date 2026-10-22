import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  hasActiveFilters?: boolean;
  style?: ViewStyle;
  showFilterButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  onSubmitEditing,
  placeholder = 'Tìm kiếm voucher, thương hiệu, ưu đãi...',
  hasActiveFilters = false,
  style,
  showFilterButton = true,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="search-outline"
          size={20}
          color={Colors.secondaryText}
          style={styles.searchIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondaryText}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          clearButtonMode="while-editing"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearIcon}
          >
            <Ionicons name="close-circle" size={18} color={Colors.tertiaryText} />
          </TouchableOpacity>
        )}
      </View>

      {showFilterButton && onFilterPress && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onFilterPress}
          style={[
            styles.filterButton,
            hasActiveFilters && styles.filterButtonActive,
          ]}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={hasActiveFilters ? Colors.white : Colors.primaryCoral}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 48,
    borderRadius: BorderRadius.card,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.primaryText,
    paddingVertical: 8,
  },
  clearIcon: {
    padding: 2,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.card,
    backgroundColor: Colors.lightPeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFDDC4',
    ...Shadows.soft,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryCoral,
    borderColor: Colors.primaryCoral,
  },
});
