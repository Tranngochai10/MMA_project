import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FormInput } from '../common/FormInput';
import { Colors } from '../../constants/theme';

interface Props { channel: 'STORE' | 'ONLINE'; onChannel: (value: 'STORE' | 'ONLINE') => void; website: string; onWebsite: (value: string) => void; }
export function BrandPresenceFields({ channel, onChannel, website, onWebsite }: Props) {
  return <View style={{ marginVertical: 16 }}>
    <Text style={{ fontWeight: '700', color: Colors.primaryText, marginBottom: 12 }}>Hình thức cửa hàng</Text>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
      {(['STORE', 'ONLINE'] as const).map(value => <TouchableOpacity accessibilityRole="radio" accessibilityState={{ checked: channel === value }} key={value} onPress={() => onChannel(value)} style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: channel === value ? Colors.primaryCoral : Colors.border, backgroundColor: channel === value ? Colors.lightPeach : Colors.white }}><Text style={{ color: Colors.primaryText, fontWeight: '600' }}>{value === 'STORE' ? 'Có cửa hàng' : 'Chỉ bán online'}</Text></TouchableOpacity>)}
    </View>
    <Text style={{ color: Colors.secondaryText, lineHeight: 21, marginBottom: 16 }}>{channel === 'STORE' ? 'Voucher tự tìm vị trí theo tên brand trên Maps. Không cần nhập địa chỉ hoặc tọa độ.' : 'Voucher sẽ mở cửa hàng online và không hiển thị bản đồ.'}</Text>
    <FormInput label={channel === 'ONLINE' ? 'Link cửa hàng online *' : 'Website thương hiệu (không bắt buộc)'} value={website} onChangeText={onWebsite} autoCapitalize="none" keyboardType="url" placeholder="https://..." />
  </View>;
}
