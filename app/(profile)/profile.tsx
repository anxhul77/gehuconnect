import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/Store';
import { TextInput, ActivityIndicator, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useGetCaptchaQuery, useErpLoginMutation } from '@/src/features/erp.api';
import { useDispatch } from 'react-redux';
import { setErpData } from '@/src/store/slices/auth.slice';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#121212',
  surface: '#1E1E1E',
  surfaceHigh: '#2A2A2A',
  card: '#282828',
  green: 'white',
  greenDark: '#158a3e',
  text: '#FFFFFF',
  textMuted: '#B3B3B3',
  textDim: '#6A6A6A',
  border: '#333333',
  activeToggle: '#1DB954',
  inactiveToggle: '#2A2A2A',
  statusActive: '#1DB954',
  statusBg: 'rgba(29,185,84,0.15)',
  accent: '#535353',
};

const erpRows = [
  { label: 'Father Name', value: 'Rajesh Jakhmola' },
  { label: 'Mother Name', value: 'Sangita Devi' },
  { label: 'D.O.B.', value: '26 / 12 / 2005' },
  { label: 'Official Email', value: 'anshuljakhmola.240111038@gehu.ac.in' },
  { label: 'College', value: 'GEHU — Dehradun Campus' },
  { label: 'Course', value: 'Bachelor of Technology' },
  { label: 'Specialization', value: 'N/A' },
  { label: 'Year / Sem', value: '2nd Year · Sem 4' },
  { label: 'Branch', value: 'B.Tech (CSE)' },
  { label: 'Section', value: 'F2' },
  { label: 'Class Roll No.', value: '13' },
  { label: 'Enroll No.', value: 'PV-24180297' },
  { label: 'University Roll No.', value: '2418297' },
  { label: 'HighSchool %', value: '69.40%' },
  { label: 'Intermediate %', value: '61.50%' },
  { label: 'Status', value: 'Active', isStatus: true },
];

const appProfile = {
  name: 'Anshul Jakhmola',
  username: '@anshul.jakhmola',
  bio: 'B.Tech CSE · GEHU Dehradun · 2024 Batch',
  followers: 128,
  following: 64,
  courses: 6,
  stats: [
    { label: 'Attendance', value: '82%' },
    { label: 'CGPA', value: '7.4' },
    { label: 'Assignments', value: '18/20' },
    { label: 'Rank', value: '#12' },
  ],
  recentActivity: [
    { icon: '📘', title: 'Data Structures', sub: 'Lecture watched · 2h ago' },
    { icon: '📝', title: 'OS Assignment', sub: 'Submitted · Yesterday' },
    { icon: '🎯', title: 'Quiz · DBMS', sub: 'Score: 9/10 · 2d ago' },
  ],
  badges: ['Dean\'s List', 'Top Coder', 'Active Learner'],
};

const Avatar = ({ size = 80, uri, name }: { size?: number; uri?: string | null; name?: string }) => {
  const initials = name
    ? name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : '??';

  const imageSource = uri ? (uri.startsWith('data:') ? uri : { uri }) : null;

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
          contentFit="cover"
        />
      ) : (
        <Text style={{ fontSize: size * 0.38, color: COLORS.bg, fontWeight: '700' }}>
          {initials}
        </Text>
      )}
    </View>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AppProfileView = ({ user }: { user: any }) => (
  <View>
    <View style={styles.profileHeader}>
      <Avatar size={90} uri={user.avatarUrl} name={user.name} />
      <Text style={styles.profileName}>{user.name}</Text>
      <Text style={styles.profileUsername}>@{user.name?.toLowerCase().replace(/\s+/g, '')}</Text>
      <Text style={styles.profileBio}>{appProfile.bio}</Text>

      <View style={styles.socialRow}>
        <View style={styles.socialItem}>
          <Text style={styles.socialNum}>{appProfile.courses}</Text>
          <Text style={styles.socialLabel}>Courses</Text>
        </View>
        <View style={styles.socialDivider} />
        <View style={styles.socialItem}>
          <Text style={styles.socialNum}>{appProfile.followers}</Text>
          <Text style={styles.socialLabel}>Followers</Text>
        </View>
        <View style={styles.socialDivider} />
        <View style={styles.socialItem}>
          <Text style={styles.socialNum}>{appProfile.following}</Text>
          <Text style={styles.socialLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        {appProfile.badges.map((b) => (
          <View key={b} style={styles.badge}>
            <Text style={styles.badgeText}>{b}</Text>
          </View>
        ))}
      </View>
    </View>

    <SectionTitle title="Academic Overview" />
    <View style={styles.statsGrid}>
      {appProfile.stats.map((s) => (
        <StatCard key={s.label} label={s.label} value={s.value} />
      ))}
    </View>

    <SectionTitle title="Recent Activity" />
    <View style={styles.card}>
      {appProfile.recentActivity.map((item, i) => (
        <View key={i} style={[styles.activityRow, i < appProfile.recentActivity.length - 1 && styles.activityBorder]}>
          <Text style={styles.activityIcon}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text style={styles.activitySub}>{item.sub}</Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const ErpProfileView = ({ user }: { user: any }) => {
  const erpData = user.erpData;
  if (!erpData) return null;

  const dynamicErpRows = [
    { label: 'Father Name', value: erpData.fatherName },
    { label: 'Mother Name', value: erpData.motherName },
    { label: 'D.O.B.', value: erpData.dob },
    { label: 'Official Email', value: erpData.officialEmail },
    { label: 'College', value: erpData.college },
    { label: 'Course', value: erpData.course },
    { label: 'Branch', value: erpData.branch },
    { label: 'Year / Sem', value: `Sem ${erpData.yearSem}` },
    { label: 'Section', value: erpData.section },
    { label: 'Class Roll No.', value: erpData.classRollNo },
    { label: 'Enroll No.', value: erpData.enrollmentNo },
    { label: 'University Roll No.', value: erpData.universityRoll },
    { label: 'HighSchool %', value: `${erpData.highSchool}%` },
    { label: 'Intermediate %', value: `${erpData.intermediate}%` },
    { label: 'Status', value: erpData.studentStatus, isStatus: true },
  ];

  return (
    <View>
      <View style={styles.profileHeader}>
        <Avatar size={90} uri={erpData.photo} name={erpData.name} />
        <Text style={styles.profileName}>{erpData.name}</Text>
        <Text style={styles.profileUsername}>Enroll: {erpData.enrollmentNo}</Text>
        <View style={[styles.badge, { marginTop: 10, alignSelf: 'center' }]}>
          <Text style={[styles.badgeText, { color: COLORS.statusActive }]}>● {erpData.studentStatus} Student</Text>
        </View>
      </View>

      <SectionTitle title="Academic Details" />
      <View style={styles.card}>
        {dynamicErpRows.map((row, i) => (
          <View
            key={row.label}
            style={[styles.erpRow, i < dynamicErpRows.length - 1 && styles.erpBorder]}
          >
            <Text style={styles.erpLabel}>{row.label}</Text>
            {row.isStatus ? (
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{row.value}</Text>
              </View>
            ) : (
              <Text style={styles.erpValue} numberOfLines={2}>{row.value}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const ErpLoginView = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dispatch = useDispatch();
  const { data: captchaData, isLoading: captchaLoading, refetch: refetchCaptcha } = useGetCaptchaQuery();
  const [erpLogin, { isLoading: isLoggingIn }] = useErpLoginMutation();

  const handleLogin = async () => {
    if (!studentId || !password || !captcha) {
      setErrorMessage('Please fill all fields');
      return;
    }

    if (!captchaData) {
      setErrorMessage('Captcha not loaded. Please try again.');
      return;
    }

    setErrorMessage(null);
    try {
      const response = await erpLogin({
        username: studentId,
        password: password,
        captcha: captcha,
        session: {
          cookies: captchaData.cookie,
          token: captchaData.token,
        },
      }).unwrap();

      console.log('ERP Login Response:', response);
      const parsedData = JSON.parse(response);
      dispatch(setErpData(parsedData));

    } catch (err: any) {
      console.log('ERP Login Error:', err);
      try {
        const errorData = typeof err.data === 'string' ? JSON.parse(err.data) : err.data;
        setErrorMessage(errorData.message || 'Login failed');
      } catch (e) {
        setErrorMessage(err.message || 'Something went wrong while logging in');
      }
      refetchCaptcha();
      setCaptcha('');
    }
  };

  return (
    <View style={{ marginTop: 16, paddingHorizontal: 4 }}>
      <SectionTitle title="ERP Login Required" />
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 24, marginTop: -4 }}>
        Please login with your University credentials to access ERP details.
      </Text>

      {errorMessage && (
        <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '500' }}>{errorMessage}</Text>
        </View>
      )}

      <View style={{ gap: 20 }}>
        <View>
          <Text style={{ color: '#B3B3B3', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Student ID</Text>
          <TextInput
            className="bg-white/[0.05] rounded-xl px-4 py-3.5 text-[15px] border border-white/12 text-white"
            placeholder="E.g. 210111xxx"
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={studentId}
            onChangeText={(t) => { setStudentId(t); setErrorMessage(null); }}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text style={{ color: '#B3B3B3', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Password</Text>
          <View className="bg-white/[0.05] rounded-xl border border-white/12 flex-row items-center pr-4">
            <TextInput
              style={{ flex: 1, color: 'white', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 }}
              placeholder="••••••••"
              placeholderTextColor="rgba(113, 113, 113, 0.5)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => { setPassword(t); setErrorMessage(null); }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#B3B3B3', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Captcha</Text>
            <TextInput
              className="bg-white/[0.05] rounded-xl px-4 py-3.5 text-[15px] border border-white/12 text-white"
              placeholder="Enter code"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={captcha}
              onChangeText={(t) => { setCaptcha(t); setErrorMessage(null); }}
              autoCapitalize="none"
            />
          </View>
          <Pressable
            onPress={() => refetchCaptcha()}
            style={{ width: 128, height: 52, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}
          >
            {captchaLoading ? (
              <ActivityIndicator color={COLORS.green} size="small" />
            ) : captchaData?.captchImageUrl ? (
              <Image
                source={{ uri: captchaData.captchImageUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            ) : (
              <Feather name="refresh-cw" size={20} color="#B3B3B3" />
            )}
          </Pressable>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoggingIn}
          style={{ backgroundColor: COLORS.green, paddingVertical: 16, borderRadius: 50, alignItems: 'center', marginTop: 16 }}
          activeOpacity={0.8}
        >
          {isLoggingIn ? (
            <ActivityIndicator color={COLORS.bg} size="small" />
          ) : (
            <Text style={{ color: COLORS.bg, fontWeight: '900', fontSize: 16 }}>Login to ERP</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'app' | 'erp'>('app');
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.auth.user);
  console.log(user)
  if (!user) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }
  return (
    <SafeAreaProvider style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Feather name="arrow-left" size={24} color="#B3B3B3" />
        <Text style={styles.topBarTitle}>Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.toggleWrapper}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'app' && styles.toggleBtnActive]}
              onPress={() => setActiveTab('app')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, activeTab === 'app' && styles.toggleTextActive]}>
                App Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'erp' && styles.toggleBtnActive]}
              onPress={() => setActiveTab('erp')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, activeTab === 'erp' && styles.toggleTextActive]}>
                ERP Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'app' ? (
            <AppProfileView user={user} />
          ) : user.isErpLoggedIn ? (
            <ErpProfileView user={user} />
          ) : (
            <ErpLoginView />
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    gap: 18,

    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  topBarTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  toggleWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 50,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 50,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.green,
  },
  toggleText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.bg,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,


  },
  profileName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  profileUsername: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  profileBio: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'space-between',
  },
  socialItem: {
    alignItems: 'center',
    flex: 1,
  },
  socialNum: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  socialLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  socialDivider: {
    width: 0.5,
    height: 30,
    backgroundColor: COLORS.border,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  badgeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    width: '47.5%',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.green,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  activityBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    fontSize: 22,
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySub: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  erpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  erpBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  erpLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  erpValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1.4,
    textAlign: 'right',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.statusBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.statusActive,
  },
  statusText: {
    color: COLORS.statusActive,
    fontSize: 12,
    fontWeight: '600',
  },
});