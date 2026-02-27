import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, StatusBar, useColorScheme } from "react-native";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Redirect, useRouter } from "expo-router";
import apiClient, { setAuthToken } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";

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
        router.replace("/(tabs)");
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
    text: { color: isDark ? "#FFFFFF" : "#020617" },
    subtitle: { color: isDark ? "#94A3B8" : "#64748B" },
    label: { color: isDark ? "#94A3B8" : "#475569" },
    formContainer: { 
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.4)" : "#FFFFFF",
      borderColor: isDark ? "#1E293B" : "#E2E8F0",
    },
    welcomeText: { color: isDark ? "#F8FAFC" : "#0F172A" },
    input: { 
      backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
      borderColor: isDark ? "#1E293B" : "#CBD5E1",
      color: isDark ? "#F8FAFC" : "#0F172A",
    },
    button: { backgroundColor: isDark ? "#FFFFFF" : "#020617" },
    buttonText: { color: isDark ? "#020617" : "#FFFFFF" },
    demoText: { color: isDark ? "#64748B" : "#94A3B8" },
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.keyboardAvoid, dynamicStyles.container]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#020617" : "#F8FAFC"} />
      <ScrollView style={[styles.container, dynamicStyles.container]} contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.header}>
          <Logo size={48} style={{ marginBottom: 12 }} />
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>PREMIUM PARKING</Text>
        </View>

        <View style={[styles.formContainer, dynamicStyles.formContainer]}>
          <Text style={[styles.welcomeText, dynamicStyles.welcomeText]}>Welcome back</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>Email Address</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="e.g. jdoe@parkit.cr"
              placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              <Pressable onPress={() => {}}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </Pressable>
            </View>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="Your secure password"
              placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              dynamicStyles.button,
              pressed && styles.loginButtonPressed,
              isLoading && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={[styles.loginButtonText, dynamicStyles.buttonText]}>
              {isLoading ? "Authenticating..." : "Sign In"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.demoText, dynamicStyles.demoText]}>Need help? Contact support</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: "#020617",
  },
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  formContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#F8FAFC",
    marginBottom: 32,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 24,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    color: "#94A3B8",
    marginLeft: 4,
  },
  forgotPassword: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3B82F6",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#F8FAFC",
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  demoText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
  },
});
