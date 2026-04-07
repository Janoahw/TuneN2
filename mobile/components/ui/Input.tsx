import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, type TextInputProps } from 'react-native';
import { colors } from '@/theme';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

interface InputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label?: string;
  error?: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

interface ControlledInputProps<T extends FieldValues> extends InputProps {
  control: Control<T>;
  name: Path<T>;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  ...props
}: InputProps & { value?: string; onChangeText?: (text: string) => void }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accentPrimary}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <Text style={styles.rightIcon}>{rightIcon}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  ...props
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgTertiary,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: colors.accentPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 16,
  },
  rightIcon: {
    fontSize: 18,
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
});
