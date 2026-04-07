import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useCallback, useEffect } from 'react';

/**
 * Configuración de animaciones premium para Parkit
 * Diseñado para ser suave y accesible para usuarios mayores
 */

export const ANIMATION_CONFIG = {
  // Duraciones suaves - no bruscas
  staggerDelay: 80,           // ms entre cada tile
  tileEntranceDuration: 500,  // ms para entrada de tile
  springDamping: 14,          // Suavidad del spring
  springStiffness: 100,       // Rigidez del spring
  
  // Easing curves elegantes
  entranceEasing: Easing.bezier(0.25, 0.1, 0.25, 1),  // Ease out cubic
  glowEasing: Easing.bezier(0.4, 0, 0.2, 1),         // Material design
};

/**
 * Hook para animación de entrada escalonada de tiles
 * Respeta la preferencia de reducción de movimiento
 */
export function useTileEntranceAnimation(index: number, isEnabled: boolean = true, reduceMotion: boolean = false) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(25);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (!isEnabled || reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      scale.value = 1;
      return;
    }

    const delay = index * ANIMATION_CONFIG.staggerDelay;

    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: ANIMATION_CONFIG.tileEntranceDuration,
        easing: ANIMATION_CONFIG.entranceEasing,
      })
    );

    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: ANIMATION_CONFIG.tileEntranceDuration,
        easing: ANIMATION_CONFIG.entranceEasing,
      })
    );

    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: ANIMATION_CONFIG.springDamping,
        stiffness: ANIMATION_CONFIG.springStiffness,
      })
    );
  }, [isEnabled, index, reduceMotion, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return animatedStyle;
}

/**
 * Hook para animación de presión en tile (feedback táctil visual)
 * Respeta la preferencia de reducción de movimiento
 */
export function useTilePressAnimation(reduceMotion: boolean = false) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatePressIn = useCallback(() => {
    if (reduceMotion) return;
    scale.value = withTiming(0.96, { duration: 100 });
    glowOpacity.value = withTiming(1, { duration: 150 });
  }, [scale, glowOpacity, reduceMotion]);

  const animatePressOut = useCallback(() => {
    if (reduceMotion) {
      scale.value = 1;
      glowOpacity.value = 0;
      return;
    }
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    glowOpacity.value = withTiming(0, { duration: 200 });
  }, [scale, glowOpacity, reduceMotion]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return {
    glowStyle,
    animatePressIn,
    animatePressOut,
  };
}

/**
 * Hook para animación de pulse en avatar (cuando está disponible)
 * Respeta la preferencia de reducción de movimiento
 */
export function useAvatarPulseAnimation(isActive: boolean, reduceMotion: boolean = false) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (!isActive || reduceMotion) {
      pulseScale.value = 1;
      pulseOpacity.value = 0;
      return;
    }

    const animate = () => {
      pulseScale.value = withTiming(1.15, { duration: 1200 }, () => {
        pulseScale.value = withTiming(1, { duration: 1200 }, animate);
      });
      pulseOpacity.value = withTiming(0, { duration: 1200 }, () => {
        pulseOpacity.value = withTiming(0.6, { duration: 1200 });
      });
    };

    animate();
  }, [isActive, reduceMotion, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return pulseStyle;
}

/**
 * Hook para animación de entrada del header
 * Respeta la preferencia de reducción de movimiento
 */
export function useHeaderEntranceAnimation(reduceMotion: boolean = false) {
  const translateY = useSharedValue(-30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      translateY.value = 0;
      opacity.value = 1;
      return;
    }
    translateY.value = withTiming(0, {
      duration: 600,
      easing: ANIMATION_CONFIG.entranceEasing,
    });
    opacity.value = withTiming(1, {
      duration: 500,
      easing: ANIMATION_CONFIG.entranceEasing,
    });
  }, [opacity, translateY, reduceMotion]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
}

export { Animated };
