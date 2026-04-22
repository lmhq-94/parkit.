import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { ValetBackButton } from './ValetBackButton';

type AnimatedBackButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  appearance?: "auth" | "surface";
  onBackAnimationStart?: () => void;
};

export function AnimatedBackButton({ 
  onPress, 
  accessibilityLabel, 
  appearance = "surface",
  onBackAnimationStart
}: AnimatedBackButtonProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Premium entrance animation with spring physics
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        delay: 250, // Elegant delay after form card appears
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const handlePress = () => {
    if (isAnimatingOut) return; // Prevent multiple animations
    
    setIsAnimatingOut(true);
    
    // Premium exit animation with staggered effects
    const scaleDown = Animated.timing(scaleAnim, {
      toValue: 0.85,
      duration: 150,
      easing: (value) => {
        // Quick ease-out for scale
        return 1 - Math.pow(1 - value, 2);
      },
      useNativeDriver: true,
    });
    
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      easing: (value) => {
        // Smooth ease-out cubic
        return 1 - Math.pow(1 - value, 3);
      },
      useNativeDriver: true,
    });
    
    const slideOut = Animated.timing(slideAnim, {
      toValue: -50,
      duration: 400,
      easing: (value) => {
        // Ease-out-back for dramatic slide
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * Math.pow(value, 3) - c1 * Math.pow(value, 2);
      },
      useNativeDriver: true,
    });
    
    // Stagger: scale down first, then slide and fade
    scaleDown.start(() => {
      Animated.parallel([fadeOut, slideOut]).start(() => {
        // Notify parent to start form card animation
        if (onBackAnimationStart) {
          onBackAnimationStart();
        }
        // Execute the original onPress after animation
        onPress();
      });
    });
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { translateX: slideAnim },
      { scale: scaleAnim }
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <ValetBackButton
        onPress={handlePress}
        accessibilityLabel={accessibilityLabel}
        appearance={appearance}
      />
    </Animated.View>
  );
}
