import { api } from '../../services/api';
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
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);

  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset>();
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled) {
        setAvatarAsset(result.assets[0]);
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Image selection failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const validate = () => {
    let isValid = true;
    setNameError('');

    if (!name.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const uploadedAvatar = avatarAsset ? (await api.uploadImage(avatarAsset)).url : avatarUrl;
      if (avatarAsset) { setAvatarUrl(uploadedAvatar); setAvatarAsset(undefined); }
      await updateProfile({ name: name.trim(), phone: phone.trim(), avatarUrl: uploadedAvatar });
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert('Không thể cập nhật hồ sơ', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally { setLoading(false); }
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
            value={currentUser.email}
            editable={false}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
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
        title="Cập nhật thành công! "
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
