import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface Props { uri?: string; style: StyleProp<ImageStyle>; fallbackIcon?: keyof typeof Ionicons.glyphMap; }
export function RemoteImage(props: Props) {
  return <ImageWithFallback key={props.uri || 'empty'} {...props} />;
}
function ImageWithFallback({ uri, style, fallbackIcon = 'ticket-outline' }: Props) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) return <View style={[style, { backgroundColor: Colors.lightPeach, alignItems: 'center', justifyContent: 'center' }]}><Ionicons name={fallbackIcon} size={30} color={Colors.primaryCoral} /></View>;
  return <Image source={{ uri }} style={style} onError={() => setFailed(true)} />;
}
