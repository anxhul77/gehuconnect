import { Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ─── Regex Validators ────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/`~\\])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/`~\\]{8,}$/;

interface FieldError {
  email?: string;
  password?: string;
}

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Animated shake ref for error
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validate = (): boolean => {
    const newErrors: FieldError = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    if (!validate()) {
      shake();
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // navigation?.navigate('Home');
    }, 1800);
  };

  const getInputBorderColor = (field: 'email' | 'password') => {
    if (!touched[field]) return COLORS.border;
    if (errors[field]) return COLORS.error;
    return COLORS.emerald;
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Background Blobs ── */}
        <View style={styles.blobTopLeft} />
        <View style={styles.blobBottomRight} />

        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
       
          <View style={styles.logoWrap}>

            <View style={styles.logoCircle}>
              <Image   source={require("../../assets/images/geuconnectlogotransparent.png")}
                    contentFit="cover"
                    transition={200}
                    
                    style={{
                      width: "100%",
                      aspectRatio:9/4
                    }}
                    />
            </View>
          
           <Text style={styles.appTagline}>
              Your campus · Your community · Your marketplace
            </Text>
         </View>

          {/* ── Card ── */}
          <Animated.View
            style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Text style={styles.cardTitle}>Login</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email / Student ID</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: getInputBorderColor('email') },
                ]}
              >
               <FontAwesome name="at" size={18} color="white" />
                <TextInput
                  style={styles.input}
                  placeholder="you@college.edu"
                  placeholderTextColor={COLORS.placeholder}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (touched.email) validate();
                  }}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, email: true }));
                    validate();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {touched.email && !errors.email && email.length > 0 && (
                  <Text style={styles.validIcon}>✅</Text>
                )}
              </View>
              {touched.email && errors.email ? (
                <Text style={styles.errorText}>⚠ {errors.email}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: getInputBorderColor('password') },
                ]}
              >
                <Entypo name="lock" size={20} color="white" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.placeholder}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (touched.password) validate();
                  }}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, password: true }));
                    validate();
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                  {showPassword ? <Feather name="eye-off" size={20} color="white" /> : <Feather name="eye" size={20} color="white" />}
                </TouchableOpacity>
              </View>
              {touched.password && errors.password ? (
                <Text style={styles.errorText}>⚠ {errors.password}</Text>
              ) : null}
            </View>

            {/* Forgot */}
            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialBtnText}>G  Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, styles.socialBtnGitHub]}>
                <Text style={styles.socialBtnText}>⚡ GitHub</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('Register')}
            >
              <Text style={styles.footerLink}>Create one →</Text>
            </TouchableOpacity>
          </View>

          {/* ── Stats Strip ── */}
         
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Colors ──────────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#0A0A0A',
  card: '#141414',
  border: '#2A2A2A',
  orange: '#FF6B00',
  orangeLight: '#FF8C2E',
  emerald: '#00C896',
  neonBlue: '#3B82FF',
  pink: '#FF3D6E',
  purple: '#9B5DE5',
  placeholder: '#555',
  textPrimary: '#FFFFFF',
  textSecondary: '#888',
  error: '#FF3D6E',
  blobOrange: 'rgba(255,107,0,0.12)',
  blobEmerald: 'rgba(0,200,150,0.10)',
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  blobTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.blobOrange,
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.blobEmerald,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  // Logo
  logoWrap: {
   
    alignItems: 'center',
   
  },
  logoCircle: {
   
    borderRadius: 36,
    
    alignItems: 'center',
    justifyContent: 'center',
   
  },
  logoIcon: { fontSize: 34 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    alignSelf:"flex-end"
  },

  // Card
  card: {
    marginTop:20,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },

  // Fields
  fieldWrap: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputRow: {
    flexDirection: 'row',
    gap:"5",
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 2,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: Platform.OS === 'android' ? 10 : 0,
  },
  eyeIcon: { fontSize: 18, paddingLeft: 8 },
  validIcon: { fontSize: 14, paddingLeft: 6 },
  errorText: {
    color: COLORS.error,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },

  // Forgot
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: COLORS.orange, fontSize: 13, fontWeight: '600' },

  // Login Button
  loginBtn: {
    backgroundColor:"#EF5B3B",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: "#EF5B3B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#252525' },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginHorizontal: 12,
  },

  // Social
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  socialBtnGitHub: { borderColor: COLORS.emerald + '40' },
  socialBtnText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },

  // Footer
  footer: {
    
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  footerLink: { color: COLORS.orange, fontSize: 14, fontWeight: '700' },

  // Stats
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.orange,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
