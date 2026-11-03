import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { Colors } from '../../constants/theme';
export function CartButton() {
  const { ids } = useCart();
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Giỏ hàng, ${ids.length} voucher`} onPress={() => router.push('/(user)/cart')} style={styles.button}>
    <Ionicons name="cart-outline" size={22} color={Colors.primaryText} />
    {ids.length > 0 && <View style={styles.badge}><Text style={styles.count}>{ids.length}</Text></View>}
  </TouchableOpacity>;
}
const styles = StyleSheet.create({ button: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' }, badge: { position: 'absolute', right: -3, top: -5, borderRadius: 10, minWidth: 20, height: 20, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }, count: { color: Colors.white, fontSize: 11, fontWeight: '700' } });
