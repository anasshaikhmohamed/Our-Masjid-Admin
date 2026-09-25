import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';

export function ThemedModal({
  visible,
  title,
  message,
  icon = 'shield',
  onClose,
  primaryLabel,
  onPrimary,
  primaryTone = 'green',
}: {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Feather.glyphMap;
  onClose: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryTone?: 'green' | 'red';
}) {
  const primaryAction = () => {
    onPrimary?.();
    if (onPrimary) return;
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather name={icon} size={20} color={primaryTone === 'red' ? colors.light.destructive : colors.light.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
              <Text style={styles.secondaryText}>CANCEL</Text>
            </Pressable>
            {primaryLabel ? (
              <Pressable
                onPress={primaryAction}
                style={({ pressed }) => [
                  styles.primary,
                  primaryTone === 'red' && styles.primaryRed,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryText}>{primaryLabel.toUpperCase()}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,77,58,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDE9E2',
    shadowColor: '#0F4D3A',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DDF3E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 14,
    color: colors.light.foreground,
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    marginTop: 8,
    color: colors.light.mutedForeground,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  secondary: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  primary: {
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryRed: {
    backgroundColor: colors.light.destructive,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  pressed: { opacity: 0.78 },
});
