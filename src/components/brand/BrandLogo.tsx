import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Shadows } from '../../constants/theme';

interface BrandLogoProps {
  url: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  url,
  name,
  size = 'md',
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  const dimensions = {
    sm: 36,
    md: 52,
    lg: 68,
    xl: 88,
  }[size];

  const firstLetter = name ? name.charAt(0).toUpperCase() : 'B';

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: dimensions / 2,
        },
        style,
      ]}
    >
      {!imageError && url ? (
        <Image
          source={{ uri: url }}
          style={[
            styles.image,
            {
              width: dimensions,
              height: dimensions,
              borderRadius: dimensions / 2,
            },
          ]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimensions,
              height: dimensions,
              borderRadius: dimensions / 2,
            },
          ]}
        >
          <Text
            style={[
              styles.fallbackText,
              { fontSize: dimensions * 0.45 },
            ]}
          >
            {firstLetter}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.soft,
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: Colors.lightPeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '800',
    color: Colors.primaryCoral,
  },
});
