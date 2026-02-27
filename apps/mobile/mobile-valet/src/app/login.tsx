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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import api, { setAuthToken } from '@/lib/api';
import { saveUser } from '@/lib/auth';
import { useAuthStore } from '@/lib/store';
import { Logo } from '@/components/Logo';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data.data;

      await setAuthToken(token);
      await saveUser(user);
      setUser(user);

      router.replace('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      Alert.alert('Login Error', message);
    } finally {
      setLoading(false);
    }
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dynamicStyles = {
    container: { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
    badgeContainer: { backgroundColor: isDark ? '#3B82F6' : '#2563EB' },
    badgeText: { color: isDark ? '#FFFFFF' : '#FFFFFF' },
    label: { color: isDark ? '#94A3B8' : '#64748B' },
    input: {
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      borderColor: isDark ? '#334155' : '#CBD5E1',
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    button: { backgroundColor: isDark ? '#3B82F6' : '#2563EB' },
    buttonText: { color: isDark ? '#FFFFFF' : '#FFFFFF' },
    demoText: { color: isDark ? '#64748B' : '#94A3B8' },
    demoHighlight: { color: isDark ? '#CBD5E1' : '#475569' },
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, dynamicStyles.container]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0F172A" : "#F8FAFC"} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Logo size={48} style={{ marginBottom: 12 }} />
          <View style={[styles.badgeContainer, dynamicStyles.badgeContainer]}>
            <Text style={[styles.badgeText, dynamicStyles.badgeText]}>VALET OPERATION</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>EMAIL ADDRESS</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="e.g. jdoe@parkit.cr"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.label, dynamicStyles.label]}>PASSWORD</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="Your secure password"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, dynamicStyles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, dynamicStyles.buttonText]}>
              {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.demo, dynamicStyles.demoText]}>
            Restricted Access. Staff only.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 56,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  form: {
    marginBottom: 48,
  },
  inputGroup: {
    marginBottom: 24,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1,
    marginLeft: 4,
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  demo: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
