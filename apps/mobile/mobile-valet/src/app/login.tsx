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
  Pressable,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import api, { setAuthToken } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";
import { Logo } from "@parkit/shared";
import { Ionicons } from "@expo/vector-icons";

const SUPPORT_EMAIL = "mailto:soporte@parkit.app";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email: email.trim(), password });

      const { token, user } = response.data.data;

      await setAuthToken(token);
      await saveUser(user);
      setUser(user);

      router.replace("/tickets");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? "#0F172A" : "#F8FAFC";
  const cardBg = isDark ? "rgba(30, 41, 59, 0.98)" : "#FFFFFF";
  const cardBorder = isDark ? "rgba(71, 85, 105, 0.4)" : "rgba(226, 232, 240, 0.9)";
  const label = isDark ? "#94A3B8" : "#475569";
  const inputBg = isDark ? "rgba(15, 23, 42, 0.9)" : "#F1F5F9";
  const inputBorder = isDark ? "rgba(51, 65, 85, 0.6)" : "rgba(203, 213, 225, 0.8)";
  const inputText = isDark ? "#F8FAFC" : "#0F172A";
  const placeholder = isDark ? "#64748B" : "#94A3B8";
  const heading = isDark ? "#F8FAFC" : "#0F172A";
  const muted = isDark ? "#64748B" : "#64748B";
  const primary = isDark ? "#3B82F6" : "#2563EB";
  const footer = isDark ? "#94A3B8" : "#64748B";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={48} style={styles.logo} darkBackground={isDark} />
          <View style={[styles.pill, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(37, 99, 235, 0.12)" }]}>
            <Text style={[styles.pillText, { color: primary }]}>VALET</Text>
          </View>
          <Text style={[styles.title, { color: heading }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: muted }]}>Sign in to access the valet system</Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.inputWrap}>
            <Text style={[styles.label, { color: label }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, borderColor: inputBorder, color: inputText },
              ]}
              placeholder="e.g. valet@parkit.cr"
              placeholderTextColor={placeholder}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrap}>
            <View style={styles.passwordRow}>
              <Text style={[styles.label, { color: label }]}>Password</Text>
              <TouchableOpacity hitSlop={12} onPress={() => {}}>
                <Text style={[styles.forgot, { color: primary }]}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.passwordInputWrap, { backgroundColor: inputBg, borderColor: inputBorder }]}>
              <TextInput
                style={[styles.passwordInput, { color: inputText }]}
                placeholder="Your password"
                placeholderTextColor={placeholder}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(null); }}
                secureTextEntry={!showPassword}
                editable={!loading}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorWrap}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: primary },
              pressed && styles.btnPressed,
              loading && styles.btnDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.btnText}>Sign in</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: footer }]}>Restricted access. Staff only. </Text>
          <Pressable onPress={() => Linking.openURL(SUPPORT_EMAIL)}>
            <Text style={[styles.footerLink, { color: primary }]}>Contact support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  inputWrap: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  forgot: {
    fontSize: 14,
    fontWeight: "600",
  },
  passwordInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeBtn: {
    padding: 4,
  },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPressed: {
    opacity: 0.92,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "600",
  },
});
