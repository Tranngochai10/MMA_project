import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from './FormInput';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface Props { label: string; value: string; onChangeText: (value: string) => void; error?: string; placeholder?: string; }
export function DateField({ label, value, onChangeText, error }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const show = () => {
    const parsed = new Date(`${value.slice(0, 10)}T12:00:00`);
    const date = Number.isFinite(parsed.getTime()) ? parsed : new Date();
    setMonth(date.getMonth()); setYear(date.getFullYear()); setOpen(true);
  };
  const move = (step: number) => { const date = new Date(year, month + step, 1); setYear(date.getFullYear()); setMonth(date.getMonth()); };
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  return <>
    <FormInput label={label} value={value} onChangeText={onChangeText} error={error} placeholder="YYYY-MM-DD" autoCapitalize="none" rightIcon={<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Chọn ${label}`} onPress={show} style={styles.trigger}><Ionicons name="calendar-outline" size={20} color={Colors.primary} /></TouchableOpacity>} />
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <View style={styles.panel} accessibilityViewIsModal>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.header}>
            <TouchableOpacity accessibilityLabel="Tháng trước" accessibilityRole="button" onPress={() => move(-1)} style={styles.trigger}><Ionicons name="chevron-back" size={21} color={Colors.primaryText} /></TouchableOpacity>
            <Text style={styles.month}>Tháng {month + 1}, {year}</Text>
            <TouchableOpacity accessibilityLabel="Tháng sau" accessibilityRole="button" onPress={() => move(1)} style={styles.trigger}><Ionicons name="chevron-forward" size={21} color={Colors.primaryText} /></TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <View key={day} style={styles.cell}><Text style={styles.weekday}>{day}</Text></View>)}
            {Array.from({ length: offset }, (_, index) => <View key={`blank-${index}`} style={styles.cell} />)}
            {Array.from({ length: count }, (_, index) => {
              const day = index + 1;
              const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const selected = date === value.slice(0, 10);
              return <TouchableOpacity key={date} accessibilityRole="button" accessibilityLabel={date} accessibilityState={{ selected }} onPress={() => { onChangeText(date); setOpen(false); }} style={[styles.cell, selected && styles.selected]}><Text style={[styles.day, selected && { color: Colors.white }]}>{day}</Text></TouchableOpacity>;
            })}
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={() => setOpen(false)} style={styles.close}><Text style={{ color: Colors.primary, fontWeight: '600' }}>Đóng</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  trigger: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  panel: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.base, width: '100%', maxWidth: 360 },
  label: { ...Typography.h3, padding: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  month: { ...Typography.h4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  day: { color: Colors.primaryText, fontSize: 14 },
  weekday: { color: Colors.secondaryText, fontSize: 12 },
  selected: { backgroundColor: Colors.primary },
  close: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
});
