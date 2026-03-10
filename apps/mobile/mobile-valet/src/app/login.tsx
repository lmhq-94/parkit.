import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import api, { setAuthToken } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";
import { Logo } from "@parkit/shared";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data.data;

      await setAuthToken(token);
      await saveUser(user);
      setUser(user);

      router.replace("/");
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const dynamicStyles = {
    container: { backgroundColor: isDark ? "#020617" : "#F8FAFC" },
    card: {
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(255, 255, 255, 0.95)",
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
    badge: { backgroundColor: isDark ? "#3B82F6" : "#2563EB" },
    button: { backgroundColor: isDark ? "#3B82F6" : "#2563EB" },
    buttonText: { color: "#FFFFFF" },
    footer: { color: isDark ? "#64748B" : "#94A3B8" },
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, dynamicStyles.container]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#020617" : "#F8FAFC"} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={52} style={styles.logo} />
          <View style={[styles.badge, dynamicStyles.badge]}>
            <Text style={styles.badgeText}>VALET OPERATION</Text>
          </View>
          <Text style={[styles.welcomeTitle, dynamicStyles.welcome]}>Welcome back</Text>
          <Text style={[styles.welcomeSub, dynamicStyles.subtitle]}>
            Sign in to access the valet system
          </Text>
        </View>

        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>Email address</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="e.g. valet@parkit.cr"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.label, dynamicStyles.label]}>Password</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="Your secure password"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, dynamicStyles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, dynamicStyles.footer]}>Restricted access. Staff only.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  welcomeSub: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 20,
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
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
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
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
  },
});
