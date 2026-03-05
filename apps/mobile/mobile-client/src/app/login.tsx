import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Redirect, useRouter } from "expo-router";
import apiClient, { setAuthToken } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";
import { getHasSeenOnboarding } from "@/lib/onboarding";

export default function LoginScreen() {
  const router = useRouter();
  const { user, setUser, setError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post<any>("/auth/login", { email, password });

      if (response.data?.data) {
        const { user, token } = response.data.data;
        await saveUser(user, token);
        setAuthToken(token);
        setUser(user, token);
        const hasSeenOnboarding = await getHasSeenOnboarding();
        router.replace(hasSeenOnboarding ? "/(tabs)" : "/onboarding");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Login failed";
      setError(errorMsg);
      Alert.alert("Login Error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const dynamicStyles = {
    container: { backgroundColor: isDark ? "#020617" : "#F8FAFC" },
    card: {
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(255, 255, 255, 0.9)",
      borderColor: isDark ? "rgba(71, 85, 105, 0.5)" : "rgba(226, 232, 240, 0.8)",
    },
    label: { color: isDark ? "#94A3B8" : "#475569" },
    input: {
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(241, 245, 249, 0.9)",
      borderColor: isDark ? "rgba(51, 65, 85, 0.8)" : "rgba(203, 213, 225, 0.8)",
      color: isDark ? "#F8FAFC" : "#0F172A",
    },
    welcome: { color: isDark ? "#F8FAFC" : "#0F172A" },
    subtitle: { color: isDark ? "#64748B" : "#64748B" },
    button: { backgroundColor: isDark ? "#3B82F6" : "#2563EB" },
    buttonText: { color: "#FFFFFF" },
    footer: { color: isDark ? "#64748B" : "#94A3B8" },
    error: { backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)", borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.25)" },
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.keyboardAvoid, dynamicStyles.container]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#020617" : "#F8FAFC"} />
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        contentContainerStyle={styles.content}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={52} style={styles.logo} />
          <Text style={[styles.badge, dynamicStyles.subtitle]}>PREMIUM PARKING</Text>
          <Text style={[styles.welcomeTitle, dynamicStyles.welcome]}>Welcome back</Text>
          <Text style={[styles.welcomeSub, dynamicStyles.subtitle]}>
            Sign in to manage your vehicles and bookings
          </Text>
        </View>

        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>Email address</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="e.g. you@company.com"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.label, dynamicStyles.label]}>Password</Text>
              <Pressable onPress={() => {}} hitSlop={8}>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </Pressable>
            </View>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="Your secure password"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              autoComplete="password"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              dynamicStyles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, dynamicStyles.footer]}>Need help? Contact support</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    marginBottom: 16,
  },
  badge: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  welcomeSub: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  inputGroup: {
    marginBottom: 22,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 2,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
  },
});
