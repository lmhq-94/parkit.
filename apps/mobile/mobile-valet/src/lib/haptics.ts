import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Sistema de Haptics Premium para Parkit
 * Feedback táctil que da sensación de "botón físico de calidad"
 */

export type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Genera feedback háptico según la intensidad especificada
 */
export async function hapticFeedback(intensity: HapticIntensity = 'medium'): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    switch (intensity) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
    // Silently fail if haptics not available
  }
}

/**
 * Haptic específico para tiles - sensación de botón premium
 */
export async function hapticTilePress(variant?: 'primary' | 'secondary'): Promise<void> {
  await hapticFeedback(variant === 'primary' ? 'medium' : 'light');
}

/**
 * Haptic para éxito - cuando se completa una acción
 */
export async function hapticSuccess(): Promise<void> {
  await hapticFeedback('success');
}

/**
 * Haptic para error - cuando hay un problema
 */
export async function hapticError(): Promise<void> {
  await hapticFeedback('error');
}

/**
 * Haptic sutil para hover/focus (solo UI feedback)
 */
export async function hapticHover(): Promise<void> {
  await hapticFeedback('light');
}
