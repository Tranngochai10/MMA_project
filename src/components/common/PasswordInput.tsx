import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormInput, FormInputProps } from './FormInput';
import { Colors } from '../../constants/theme';

export const PasswordInput: React.FC<Omit<FormInputProps, 'rightIcon' | 'secureTextEntry'>> = (
  props
) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormInput
      {...props}
      secureTextEntry={!showPassword}
      leftIcon="lock-closed-outline"
      rightIcon={
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.secondaryText}
          />
        </TouchableOpacity>
      }
    />
  );
};
