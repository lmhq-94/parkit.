import { useEffect, useRef, useCallback } from "react";
import { Animated, Easing } from "react-native";

/**
 * Hook para animación de entrada del header usando Animated nativo
 */
export function useHeaderEntranceAnimation(reduceMotion: boolean = false) {
  const translateY = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      translateY.setValue(0);
      opacity.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [reduceMotion, translateY, opacity]);

  return { transform: [{ translateY }], opacity };
}

/**
 * Hook para animación de pulse en avatar usando Animated nativo
 */
export function useAvatarPulseAnimation(isActive: boolean, reduceMotion: boolean = false) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startAnimation = useCallback(() => {
    const scaleAnim = Animated.sequence([
      Animated.timing(pulseScale, {
        toValue: 1.15,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseScale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    const opacityAnim = Animated.sequence([
      Animated.timing(pulseOpacity, {
        toValue: 0,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseOpacity, {
        toValue: 0.6,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    animationRef.current = Animated.parallel([scaleAnim, opacityAnim]);
    
    animationRef.current.start(({ finished }) => {
      if (finished && isActive && !reduceMotion) {
        startAnimation();
      }
    });
  }, [isActive, reduceMotion, pulseScale, pulseOpacity]);

  useEffect(() => {
    if (!isActive || reduceMotion) {
      animationRef.current?.stop();
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
      return;
    }

    startAnimation();

    return () => {
      animationRef.current?.stop();
    };
  }, [isActive, reduceMotion, startAnimation, pulseScale, pulseOpacity]);

  return { transform: [{ scale: pulseScale }], opacity: pulseOpacity };
}
