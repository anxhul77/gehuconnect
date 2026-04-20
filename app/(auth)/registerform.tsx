import React, { useState, useRef, useCallback } from 'react';
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
  Modal,
  FlatList,
  Pressable,
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Regex Validators ────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,20}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-])[A-Za-z\d@$!%*?&#^()_+\-]{8,}$/;

// ─── Data ─────────────────────────────────────────────────────────────────────
const COURSES = [
  'B.Tech CSE', 'B.Tech ECE', 'B.Tech ME', 'B.Tech Civil', 'B.Tech EE',
  'BCA', 'MCA', 'B.Sc Computer Science', 'B.Sc Physics', 'B.Sc Chemistry',
  'MBA', 'M.Tech', 'BBA', 'B.Com', 'B.A English', 'B.A Economics',
  'MBBS', 'BDS', 'B.Pharm', 'LLB', 'B.Arch',
];

const COLLEGES = [
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'BITS Pilani', 'NIT Trichy', 'NIT Warangal', 'NIT Surathkal',
  'Graphic Era University', 'Delhi University', 'Mumbai University',
  'Anna University', 'Pune University', 'VIT Vellore',
  'Amity University', 'Manipal University', 'SRM University',
  'Lovely Professional University', 'Chandigarh University',
  'Jadavpur University', 'Osmania University', 'Jamia Millia Islamia',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Alumni'];

const INTERESTS = [
  { id: 'tech', label: '💻 Tech & Coding', color: '#3B82FF' },
  { id: 'gaming', label: '🎮 Gaming', color: '#9B5DE5' },
  { id: 'music', label: '🎵 Music', color: '#FF3D6E' },
  { id: 'design', label: '🎨 Design & Art', color: '#FF6B00' },
  { id: 'sports', label: '⚽ Sports', color: '#00C896' },
  { id: 'finance', label: '📈 Finance & Crypto', color: '#FFD700' },
  { id: 'photography', label: '📷 Photography', color: '#FF8C2E' },
  { id: 'writing', label: '✍️ Writing & Blogs', color: '#3B82FF' },
  { id: 'startup', label: '🚀 Startups', color: '#FF3D6E' },
  { id: 'anime', label: '⛩️ Anime & Manga', color: '#9B5DE5' },
  { id: 'fitness', label: '🏋️ Fitness', color: '#00C896' },
  { id: 'food', label: '🍕 Food & Cooking', color: '#FF6B00' },
  { id: 'travel', label: '✈️ Travel', color: '#3B82FF' },
  { id: 'fashion', label: '👗 Fashion', color: '#FF3D6E' },
  { id: 'research', label: '🔬 Research & Science', color: '#00C896' },
];

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  course: string;
  college: string;
  year: string;
  bio: string;
  gender: string;
  interests: string[];
}

interface Errors {
  [key: string]: string;
}

// ─── Sub-component: SearchModal ───────────────────────────────────────────────
function SearchModal({
  visible,
  title,
  data,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  data: string[];
  onSelect: (val: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = data.filter((d) =>
    d.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>{title}</Text>
          <View style={modalStyles.searchRow}>
            <Text style={modalStyles.searchIcon}>🔍</Text>
            <TextInput
              style={modalStyles.searchInput}
              placeholder={`Search ${title.toLowerCase()}...`}
              placeholderTextColor="#555"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={{ color: '#888', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={modalStyles.item}
                onPress={() => {
                  onSelect(item);
                  setQuery('');
                  onClose();
                }}
              >
                <Text style={modalStyles.itemText}>{item}</Text>
                <Text style={{ color: COLORS.orange, fontSize: 12 }}>SELECT →</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={modalStyles.emptyText}>No results found</Text>
            }
          />
          <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
            <Text style={modalStyles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Symbol', pass: /[@$!%*?&#^()_+\-]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const strengthColor = ['', COLORS.error, COLORS.yellow, COLORS.orange, COLORS.emerald][score];

  return (
    <View style={pwStyles.wrap}>
      <View style={pwStyles.barRow}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              pwStyles.bar,
              { backgroundColor: i <= score ? strengthColor : '#252525' },
            ]}
          />
        ))}
        {score > 0 && (
          <Text style={[pwStyles.label, { color: strengthColor }]}>
            {strengthLabel}
          </Text>
        )}
      </View>
      <View style={pwStyles.checkRow}>
        {checks.map((c) => (
          <View key={c.label} style={pwStyles.check}>
            <Text style={{ color: c.pass ? COLORS.emerald : '#444', fontSize: 10 }}>
              {c.pass ? '✓' : '○'} {c.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }: { navigation?: any }) {
  const [form, setForm] = useState<FormState>({
    username: '', email: '', phone: '', password: '',
    confirmPassword: '', course: '', college: '',
    year: '', bio: '', gender: '', interests: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [modal, setModal] = useState<{ type: 'course' | 'college' | null }>({ type: null });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [step]);

  const update = (field: keyof FormState, value: string | string[]) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (touched[field]) validateField(field, value as string);
  };

  const touch = (field: string) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const validateField = (field: keyof FormState, value: string): string => {
    switch (field) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (!USERNAME_REGEX.test(value))
          return '3-20 chars, letters/numbers/._  only';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_REGEX.test(value.trim())) return 'Enter a valid email';
        return '';
      case 'phone':
        if (value && !PHONE_REGEX.test(value)) return 'Enter valid 10-digit mobile number';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (!PASSWORD_REGEX.test(value))
          return 'Min 8 chars, 1 uppercase, 1 number, 1 symbol';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== form.password) return 'Passwords do not match';
        return '';
      case 'course':
        if (!value.trim()) return 'Course is required';
        return '';
      case 'college':
        if (!value.trim()) return 'College is required';
        return '';
      case 'year':
        if (!value) return 'Please select your year';
        return '';
      default:
        return '';
    }
  };

  const validateStep = (s: number): boolean => {
    const fieldsPerStep: { [k: number]: (keyof FormState)[] } = {
      1: ['username', 'email', 'phone', 'password', 'confirmPassword'],
      2: ['course', 'college', 'year'],
      3: [],
    };
    const newErrors: Errors = {};
    const newTouched: { [k: string]: boolean } = {};
    fieldsPerStep[s].forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, form[f] as string);
      if (err) newErrors[f] = err;
    });
    setErrors((p) => ({ ...p, ...newErrors }));
    setTouched((p) => ({ ...p, ...newTouched }));
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
  };

  const prevStep = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(-30);
    setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleRegister = () => {
    if (!validateStep(3)) return;
    if (form.interests.length === 0) {
      setErrors((p) => ({ ...p, interests: 'Pick at least one interest' }));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // navigation?.navigate('Home');
    }, 2000);
  };

  const toggleInterest = (id: string) => {
    setForm((p) => {
      const exists = p.interests.includes(id);
      const updated = exists
        ? p.interests.filter((i) => i !== id)
        : p.interests.length < 8
        ? [...p.interests, id]
        : p.interests;
      return { ...p, interests: updated };
    });
    setErrors((p) => ({ ...p, interests: '' }));
  };

  const inputBorder = (field: string) => {
    if (!touched[field]) return COLORS.border;
    if (errors[field]) return COLORS.error;
    return COLORS.emerald;
  };

  const stepTitles = ['Your Identity', 'Academic Info', 'Interests & Bio'];
  const stepIcons = ['👤', '🎓', '✨'];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Search Modals */}
      <SearchModal
        visible={modal.type === 'course'}
        title="Course"
        data={COURSES}
        onSelect={(v) => update('course', v)}
        onClose={() => setModal({ type: null })}
      />
      <SearchModal
        visible={modal.type === 'college'}
        title="College"
        data={COLLEGES}
        onSelect={(v) => update('college', v)}
        onClose={() => setModal({ type: null })}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Blobs */}
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.navigate('Login')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={{ fontSize: 22 }}>🎓</Text>
            </View>
            <Text style={styles.appName}>CampusConnect</Text>
          </View>
          <Text style={styles.headerSub}>Create your account</Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  step === s && styles.stepCircleActive,
                  step > s && styles.stepCircleDone,
                ]}
              >
                <Text
                  style={[
                    styles.stepNum,
                    (step === s || step > s) && { color: '#000' },
                  ]}
                >
                  {step > s ? '✓' : s}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  step === s && { color: COLORS.orange },
                ]}
              >
                {stepTitles[s - 1]}
              </Text>
              {s < 3 && (
                <View
                  style={[
                    styles.stepLine,
                    step > s && { backgroundColor: COLORS.emerald },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${((step - 1) / 2) * 100 + 33}%` as any },
            ]}
          />
        </View>

        {/* Step Label */}
        <Animated.View
          style={[
            styles.stepCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.stepTitle}>
            {stepIcons[step - 1]}  {stepTitles[step - 1]}
          </Text>

          {/* ── STEP 1: Identity ── */}
          {step === 1 && (
            <>
              {/* Username */}
              <Field
                label="Username"
                icon="@"
                placeholder="your_username"
                value={form.username}
                onChangeText={(t) => update('username', t)}
                onBlur={() => { touch('username'); setErrors(p => ({ ...p, username: validateField('username', form.username) })); }}
                error={touched.username ? errors.username : ''}
                valid={touched.username && !errors.username && form.username.length > 0}
                autoCapitalize="none"
                borderColor={inputBorder('username')}
              />

              {/* Email */}
              <Field
                label="College Email"
                icon="✉️"
                placeholder="you@college.edu"
                value={form.email}
                onChangeText={(t) => update('email', t)}
                onBlur={() => { touch('email'); setErrors(p => ({ ...p, email: validateField('email', form.email) })); }}
                error={touched.email ? errors.email : ''}
                valid={touched.email && !errors.email && form.email.length > 0}
                keyboardType="email-address"
                autoCapitalize="none"
                borderColor={inputBorder('email')}
              />

              {/* Phone */}
              <Field
                label="Phone (Optional)"
                icon="📱"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChangeText={(t) => update('phone', t)}
                onBlur={() => { touch('phone'); setErrors(p => ({ ...p, phone: validateField('phone', form.phone) })); }}
                error={touched.phone ? errors.phone : ''}
                valid={touched.phone && !errors.phone && form.phone.length > 0}
                keyboardType="phone-pad"
                borderColor={inputBorder('phone')}
              />

              {/* Password */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputRow, { borderColor: inputBorder('password') }]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min 8 chars with symbols"
                    placeholderTextColor={COLORS.placeholder}
                    value={form.password}
                    onChangeText={(t) => update('password', t)}
                    onBlur={() => { touch('password'); setErrors(p => ({ ...p, password: validateField('password', form.password) })); }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                    <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password ? (
                  <Text style={styles.err}>⚠ {errors.password}</Text>
                ) : null}
                {form.password.length > 0 && <PasswordStrength password={form.password} />}
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputRow, { borderColor: inputBorder('confirmPassword') }]}>
                  <Text style={styles.inputIcon}>🔑</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor={COLORS.placeholder}
                    value={form.confirmPassword}
                    onChangeText={(t) => update('confirmPassword', t)}
                    onBlur={() => { touch('confirmPassword'); setErrors(p => ({ ...p, confirmPassword: validateField('confirmPassword', form.confirmPassword) })); }}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm((s) => !s)}>
                    <Text style={styles.eye}>{showConfirm ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword ? (
                  <Text style={styles.err}>⚠ {errors.confirmPassword}</Text>
                ) : null}
                {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword && (
                  <Text style={[styles.err, { color: COLORS.emerald }]}>✓ Passwords match</Text>
                )}
              </View>
            </>
          )}

          {/* ── STEP 2: Academic Info ── */}
          {step === 2 && (
            <>
              {/* Course Selector */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Course / Program</Text>
                <TouchableOpacity
                  style={[styles.inputRow, { borderColor: inputBorder('course') }]}
                  onPress={() => setModal({ type: 'course' })}
                >
                  <Text style={styles.inputIcon}>📚</Text>
                  <Text style={[styles.input, !form.course && { color: COLORS.placeholder }]}>
                    {form.course || 'Search & select your course...'}
                  </Text>
                  <Text style={{ color: COLORS.orange, fontSize: 14, fontWeight: '700' }}>▼</Text>
                </TouchableOpacity>
                {touched.course && errors.course ? (
                  <Text style={styles.err}>⚠ {errors.course}</Text>
                ) : null}
              </View>

              {/* College Selector */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>College / University</Text>
                <TouchableOpacity
                  style={[styles.inputRow, { borderColor: inputBorder('college') }]}
                  onPress={() => setModal({ type: 'college' })}
                >
                  <Text style={styles.inputIcon}>🏛️</Text>
                  <Text style={[styles.input, !form.college && { color: COLORS.placeholder }]}>
                    {form.college || 'Search & select your college...'}
                  </Text>
                  <Text style={{ color: COLORS.orange, fontSize: 14, fontWeight: '700' }}>▼</Text>
                </TouchableOpacity>
                {touched.college && errors.college ? (
                  <Text style={styles.err}>⚠ {errors.college}</Text>
                ) : null}
              </View>

              {/* Year */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Academic Year</Text>
                <View style={styles.chipRow}>
                  {YEARS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.chip,
                        form.year === y && styles.chipActive,
                      ]}
                      onPress={() => { update('year', y); touch('year'); }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.year === y && styles.chipTextActive,
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.year && errors.year ? (
                  <Text style={styles.err}>⚠ {errors.year}</Text>
                ) : null}
              </View>

              {/* Gender */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Gender (Optional)</Text>
                <View style={styles.chipRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.chip,
                        form.gender === g && styles.chipEmerald,
                      ]}
                      onPress={() => update('gender', g)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.gender === g && { color: '#000', fontWeight: '700' },
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Roll Number */}
              <Field
                label="Roll No. / Enrollment ID (Optional)"
                icon="🆔"
                placeholder="e.g. 22BCE0001"
                value={form.bio}
                onChangeText={(t) => update('bio', t)}
                borderColor={COLORS.border}
              />
            </>
          )}

          {/* ── STEP 3: Interests & Bio ── */}
          {step === 3 && (
            <>
              {/* Interests */}
              <View style={styles.fieldWrap}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Your Interests</Text>
                  <Text style={styles.labelHint}>
                    {form.interests.length}/8 selected
                  </Text>
                </View>
                <Text style={styles.fieldSubtitle}>
                  Helps us match you with the right communities & feeds
                </Text>
                <View style={styles.interestGrid}>
                  {INTERESTS.map((item) => {
                    const active = form.interests.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.interestChip,
                          active && { backgroundColor: item.color + '22', borderColor: item.color },
                        ]}
                        onPress={() => toggleInterest(item.id)}
                      >
                        <Text
                          style={[
                            styles.interestText,
                            active && { color: item.color, fontWeight: '700' },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.interests ? (
                  <Text style={styles.err}>⚠ {errors.interests}</Text>
                ) : null}
              </View>

              {/* Bio */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Bio (Optional)</Text>
                <View style={[styles.inputRow, styles.bioRow, { borderColor: COLORS.border, alignItems: 'flex-start' }]}>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 2 }]}
                    placeholder="Tell your campus what you're about... 🔥"
                    placeholderTextColor={COLORS.placeholder}
                    value={form.bio}
                    onChangeText={(t) => update('bio', t)}
                    multiline
                    maxLength={160}
                  />
                </View>
                <Text style={styles.charCount}>{form.bio.length}/160</Text>
              </View>

              {/* Terms */}
              <View style={styles.termsRow}>
                <Text style={styles.termsText}>
                  By registering, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>{' '}
                  and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.primaryBtnText}>🚀  Create My Account</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ── Navigation Buttons ── */}
          <View style={styles.navRow}>
            {step > 1 && (
              <TouchableOpacity style={styles.prevBtn} onPress={prevStep}>
                <Text style={styles.prevBtnText}>← Back</Text>
              </TouchableOpacity>
            )}
            {step < 3 && (
              <TouchableOpacity
                style={[styles.nextBtn, step === 1 && { flex: 1 }]}
                onPress={nextStep}
              >
                <Text style={styles.nextBtnText}>Continue →</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({
  label, icon, placeholder, value, onChangeText, onBlur,
  error, valid, keyboardType, autoCapitalize, borderColor,
}: any) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, { borderColor }]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
        />
        {valid && <Text style={{ fontSize: 14, paddingLeft: 6 }}>✅</Text>}
      </View>
      {error ? <Text style={styles.err}>⚠ {error}</Text> : null}
    </View>
  );
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#0A0A0A',
  card: '#131313',
  border: '#2A2A2A',
  orange: '#FF6B00',
  orangeLight: '#FF8C2E',
  emerald: '#00C896',
  neonBlue: '#3B82FF',
  pink: '#FF3D6E',
  purple: '#9B5DE5',
  yellow: '#FFD700',
  placeholder: '#555',
  textPrimary: '#FFFFFF',
  textSecondary: '#888',
  error: '#FF3D6E',
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingBottom: 60 },
  blobTR: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,107,0,0.10)',
  },
  blobBL: {
    position: 'absolute', bottom: 100, left: -80,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(0,200,150,0.08)',
  },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: COLORS.textSecondary, fontSize: 14 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  logoCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: 13, color: COLORS.textSecondary },

  // Steps
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 8,
    justifyContent: 'space-between',
  },
  stepItem: { alignItems: 'center', flex: 1, position: 'relative' },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4, backgroundColor: COLORS.bg,
  },
  stepCircleActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange },
  stepCircleDone: { borderColor: COLORS.emerald, backgroundColor: COLORS.emerald },
  stepNum: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  stepLabel: { fontSize: 9, color: COLORS.textSecondary, textAlign: 'center' },
  stepLine: {
    position: 'absolute', top: 16, left: '50%',
    right: '-50%', height: 2,
    backgroundColor: COLORS.border, zIndex: -1,
  },

  // Progress
  progressBg: {
    height: 3, backgroundColor: '#1A1A1A',
    marginHorizontal: 20, borderRadius: 2, marginBottom: 20,
  },
  progressFill: {
    height: 3, backgroundColor: COLORS.orange,
    borderRadius: 2,
  },

  // Step Card
  stepCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24, marginHorizontal: 16,
    padding: 20,
    borderWidth: 1, borderColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 20,
    elevation: 8,
  },
  stepTitle: {
    fontSize: 18, fontWeight: '700',
    color: COLORS.textPrimary, marginBottom: 20,
  },

  // Fields
  fieldWrap: { marginBottom: 16 },
  label: {
    fontSize: 11, fontWeight: '700',
    color: COLORS.textSecondary, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  labelHint: { fontSize: 11, color: COLORS.orange, fontWeight: '600' },
  fieldSubtitle: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 10 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#181818', borderRadius: 14,
    borderWidth: 1.5, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 2,
  },
  bioRow: { paddingVertical: 12 },
  inputIcon: { fontSize: 15, marginRight: 8 },
  input: {
    flex: 1, color: COLORS.textPrimary,
    fontSize: 14, paddingVertical: Platform.OS === 'android' ? 10 : 0,
  },
  eye: { fontSize: 18, paddingLeft: 8 },
  err: { color: COLORS.error, fontSize: 11, marginTop: 4, marginLeft: 2 },
  charCount: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: '#1A1A1A',
  },
  chipActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '20' },
  chipEmerald: { borderColor: COLORS.emerald, backgroundColor: COLORS.emerald + '20' },
  chipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: COLORS.orange, fontWeight: '700' },

  // Interests
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: '#181818',
  },
  interestText: { color: COLORS.textSecondary, fontSize: 12 },

  // Terms
  termsRow: { marginBottom: 20 },
  termsText: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 18, textAlign: 'center' },
  termsLink: { color: COLORS.orange, fontWeight: '600' },

  // Buttons
  primaryBtn: {
    backgroundColor: COLORS.orange, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
    marginBottom: 8,
  },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  prevBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center',
  },
  prevBtnText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  nextBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 14,
    backgroundColor: COLORS.orange, alignItems: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  nextBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },

  // Footer
  footer: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 24,
  },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  footerLink: { color: COLORS.orange, fontSize: 14, fontWeight: '700' },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#141414', borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderColor: '#252525',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#333', alignSelf: 'center', marginBottom: 16,
  },
  title: {
    fontSize: 18, fontWeight: '700',
    color: '#FFFFFF', marginBottom: 14,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E1E', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 2,
    borderWidth: 1.5, borderColor: '#2A2A2A', marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1E1E1E',
  },
  itemText: { color: '#FFF', fontSize: 14 },
  emptyText: { color: '#555', textAlign: 'center', paddingVertical: 20, fontSize: 14 },
  closeBtn: {
    marginTop: 16, paddingVertical: 14,
    backgroundColor: '#1E1E1E', borderRadius: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A',
  },
  closeBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
});

// ─── Password Strength Styles ─────────────────────────────────────────────────
const pwStyles = StyleSheet.create({
  wrap: { marginTop: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: '700', marginLeft: 6 },
  checkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  check: {},
});
