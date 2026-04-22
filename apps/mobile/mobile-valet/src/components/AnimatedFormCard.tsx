import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

type AnimatedFormCardProps = {
  children: React.ReactNode;
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  animationType?: 'fade' | 'slide_from_right' | 'slide_from_left' | 'slide_from_bottom';
  onExitComplete?: () => void;
};

export const AnimatedFormCard = forwardRef<(() => void) | undefined, AnimatedFormCardProps>(
  ({ 
    children, 
    isVisible, 
    style, 
    animationType = 'fade',
    onExitComplete
  }, ref) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideXAnim = useRef(new Animated.Value(0)).current;
  const slideYAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      
      // Reset animations with more dramatic initial positions
      fadeAnim.setValue(0);
      slideXAnim.setValue(animationType === 'slide_from_right' ? 60 : animationType === 'slide_from_left' ? -60 : 0);
      slideYAnim.setValue(animationType === 'slide_from_bottom' ? 80 : 0);
      
      // Premium spring animation for entrance
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideXAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(slideYAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Smooth fade out with easing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        easing: (value) => {
          // Custom easing curve for premium feel
          return 1 - Math.pow(1 - value, 3);
        },
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible, fadeAnim, slideXAnim, slideYAnim, animationType]);

  useImperativeHandle(ref, () => startExitAnimation);

  const startExitAnimation = () => {
    if (isExiting) return;
    setIsExiting(true);
    
    // Premium exit animation with staggered timing
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      easing: (value) => {
        // Ease-out cubic for smooth fade
        return 1 - Math.pow(1 - value, 4);
      },
      useNativeDriver: true,
    });
    
    const slideOut = Animated.parallel([
      Animated.timing(slideXAnim, {
        toValue: animationType === 'slide_from_right' ? 80 : animationType === 'slide_from_left' ? -80 : 0,
        duration: 450,
        easing: (value) => {
          // Ease-out-back for dramatic slide
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return c3 * Math.pow(value, 3) - c1 * Math.pow(value, 2);
        },
        useNativeDriver: true,
      }),
      Animated.timing(slideYAnim, {
        toValue: animationType === 'slide_from_bottom' ? 100 : 0,
        duration: 450,
        easing: (value) => {
          // Ease-out-back for dramatic slide
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return c3 * Math.pow(value, 3) - c1 * Math.pow(value, 2);
        },
        useNativeDriver: true,
      }),
    ]);
    
    // Stagger the animations: slide starts slightly before fade
    slideOut.start();
    setTimeout(() => fadeOut.start(), 50);
    
    // Complete callback
    setTimeout(() => {
      setShouldRender(false);
      if (onExitComplete) {
        onExitComplete();
      }
    }, 450);
  };

  if (!shouldRender) {
    return null;
  }

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { translateX: slideXAnim },
      { translateY: slideYAnim }
    ],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
});
