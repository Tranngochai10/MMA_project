import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { FormInput } from '../../components/common/FormInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SuccessModal } from '../../components/common/SuccessModal';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function EditProfileScreen() {
  const { currentUser, updateProfile } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        // Fallback demo avatars cycle
        const avatars = [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        ];
        const next = avatars[(avatars.indexOf(avatarUrl) + 1) % avatars.length];
        setAvatarUrl(next);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch {
      // Toggle demo avatar safely
      const demoAvatars = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      ];
      setAvatarUrl(demoAvatars[0]);
    }
  };

  const validate = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');

    if (!name.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Định dạng email không hợp lệ');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      updateProfile({
        name,
        email,
        phone,
        avatarUrl,
      });
      setShowSuccessModal(true);
    }, 600);
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Chỉnh sửa hồ sơ" subtitle="Cập nhật thông tin cá nhân của bạn" showBack />

      <View style={styles.container}>
        {/* Avatar Preview & Upload Trigger */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickImage}
              style={styles.cameraBtn}
            >
              <Ionicons name="camera" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Chạm máy ảnh để đổi ảnh đại diện</Text>
        </View>

        {/* Input Form */}
        <View style={styles.form}>
          <FormInput
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={name}
            onChangeText={(txt: string) => {
              setName(txt);
              if (nameError) setNameError('');
            }}
            leftIcon="person-outline"
            error={nameError}
          />

          <FormInput
            label="Địa chỉ Email"
            placeholder="nguyenvana@example.com"
            value={email}
            onChangeText={(txt: string) => {
              setEmail(txt);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={emailError}
          />

          <FormInput
            label="Số điện thoại"
            placeholder="0912 345 678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />

          <PrimaryButton
            title="Lưu thay đổi"
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />
        </View>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        title="Cập nhật thành công! ✨"
        message="Thông tin hồ sơ của bạn đã được lưu thành công."
        buttonLabel="Quay lại hồ sơ"
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.primaryCoral,
    ...Shadows.card,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryCoral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.soft,
  },
  changePhotoText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  saveBtn: {
    marginTop: Spacing.base,
  },
});
