import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandMap } from './BrandMap';
import { Colors, Typography } from '../../constants/theme';

interface Props { name: string; salesChannel?: 'STORE' | 'ONLINE'; websiteUrl?: string; compact?: boolean; }
export function BrandPresence({ name, salesChannel = 'STORE', websiteUrl, compact = false }: Props) {
  const [error, setError] = useState(false);
  const online = salesChannel === 'ONLINE';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(name)}`;
  const open = async (url: string) => {
    if (!/^https?:\/\//i.test(url)) { setError(true); return; }
    try { setError(false); await Linking.openURL(url); } catch { setError(true); }
  };
  return <View style={styles.card}>
    <View style={styles.heading}><Ionicons name={online ? 'globe-outline' : 'storefront-outline'} size={20} color={Colors.primaryCoral} /><Text style={styles.title}>{online ? 'Cửa hàng online' : 'Tìm cửa hàng theo thương hiệu'}</Text></View>
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.body}>{online ? 'Thương hiệu bán online. Xem cách đặt hàng và sử dụng voucher tại cửa hàng trực tuyến.' : 'Tìm trên Google Maps theo tên thương hiệu. Chọn đúng cửa hàng trong kết quả để xem vị trí và chỉ đường.'}</Text>
    {!online && !compact && !!name && <BrandMap query={name} />}
    {online ? websiteUrl ? <TouchableOpacity accessibilityRole="link" style={styles.button} onPress={() => void open(websiteUrl)}><Text style={styles.buttonText}>Mở cửa hàng online</Text><Ionicons name="open-outline" size={16} color={Colors.white} /></TouchableOpacity> : <Text style={styles.body}>Thương hiệu chưa cập nhật liên kết cửa hàng online.</Text>
      : !!name && <>
        <TouchableOpacity accessibilityRole="link" style={styles.button} onPress={() => void open(mapsUrl)}><Text style={styles.buttonText}>Tìm {name} trên Maps</Text><Ionicons name="arrow-forward" size={16} color={Colors.white} /></TouchableOpacity>
        {!compact && <>
          <Text style={styles.body}>Không tìm thấy đúng cửa hàng? Brand có thể chưa có hồ sơ trên Maps. Bạn có thể tìm thông tin thương hiệu trên web trước khi đến.</Text>
          <TouchableOpacity accessibilityRole="link" style={styles.secondary} onPress={() => void open(websiteUrl || searchUrl)}><Text style={styles.secondaryText}>{websiteUrl ? 'Xem website của thương hiệu' : 'Tìm thương hiệu trên web'}</Text><Ionicons name="open-outline" size={14} color={Colors.primaryCoral} /></TouchableOpacity>
        </>}
      </>}
    {error && <Text accessibilityRole="alert" style={{ color: Colors.error, marginTop: 12 }}>Không mở được liên kết. Vui lòng thử lại.</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginTop: 12 },
  heading: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  title: { ...Typography.h4, flex: 1 },
  name: { color: Colors.primaryCoral, fontWeight: '700', marginTop: 12 },
  body: { ...Typography.body, color: Colors.secondaryText, marginVertical: 12, lineHeight: 22 },
  button: { backgroundColor: Colors.primaryCoral, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  buttonText: { color: Colors.white, flex: 1, fontWeight: '600', fontSize: 13 },
  secondary: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  secondaryText: { color: Colors.primaryCoral, fontWeight: '600', fontSize: 13 },
});
