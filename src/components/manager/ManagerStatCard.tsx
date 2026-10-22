import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';

interface ManagerStatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subValue?: string;
  style?: ViewStyle;
}

export const ManagerStatCard: React.FC<ManagerStatCardProps> = ({
  label,
  value,
  icon,
  color = Colors.primaryCoral,
  subValue,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    minWidth: 140,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subValue: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
  },
  value: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.primaryText,
    fontWeight: '800',
  },
  label: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
    fontWeight: '600',
  },
});
