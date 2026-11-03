import React from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export function BrandMap({ query }: { query: string }) {
  return (
    <View style={{ height: 220, overflow: 'hidden', borderRadius: 12 }}>
      <WebView
        source={{ uri: `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` }}
        startInLoadingState
        renderError={() => <Text>Không tải được bản đồ. Vui lòng dùng nút mở Google Maps bên dưới.</Text>}
      />
    </View>
  );
}
