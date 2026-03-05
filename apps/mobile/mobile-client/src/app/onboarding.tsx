import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  useColorScheme,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Logo } from "@/components/Logo";
import { setHasSeenOnboarding } from "@/lib/onboarding";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "car-side" as const,
    title: "Your parking, simplified",
    description: "Manage your vehicles and book parking in a few taps. No more paper tickets.",
  },
  {
    icon: "ticket-outline" as const,
    title: "Digital tickets",
    description: "Check in and out with a single scan. Your valet and history always at hand.",
  },
  {
    icon: "shield-check" as const,
    title: "Secure and reliable",
    description: "Your data is protected. Park with confidence at premium locations.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#020617" : "#F8FAFC";
  const cardBg = isDark ? "rgba(30, 41, 59, 0.5)" : "#FFFFFF";
  const text = isDark ? "#F8FAFC" : "#0F172A";
  const subtext = isDark ? "#94A3B8" : "#64748B";
  const dotActive = isDark ? "#3B82F6" : "#2563EB";
  const dotInactive = isDark ? "rgba(148, 163, 184, 0.4)" : "rgba(100, 116, 139, 0.35)";

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offset / SCREEN_WIDTH);
    if (newIndex !== index && newIndex >= 0 && newIndex < SLIDES.length) {
      setIndex(newIndex);
    }
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * SCREEN_WIDTH, animated: true });
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    await setHasSeenOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={bg} />

      <View style={styles.topBar}>
        <Logo size={32} style={styles.topLogo} />
        <Pressable onPress={finishOnboarding} hitSlop={12} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.skipText, { color: subtext }]}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconWrap, { backgroundColor: cardBg }]}>
              <MaterialCommunityIcons name={slide.icon} size={56} color={dotActive} />
            </View>
            <Text style={[styles.title, { color: text }]}>{slide.title}</Text>
            <Text style={[styles.description, { color: subtext }]}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? dotActive : dotInactive },
                i === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: dotActive },
            pressed && styles.nextButtonPressed,
          ]}
        >
          <Text style={styles.nextButtonText}>
            {index === SLIDES.length - 1 ? "Get started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  topLogo: { marginRight: 8 },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    alignItems: "center",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 32,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  nextButtonPressed: {
    opacity: 0.92,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
