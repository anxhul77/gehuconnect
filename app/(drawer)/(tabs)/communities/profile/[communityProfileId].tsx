import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  FlatList,
  Pressable,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = (width - 3) / 3;

const COMMUNITY = {
  name: 'GEU Dev Club',
  handle: '@gedevclub',
  university: 'Graphic Era University · P2P',
  bio: 'Builders & hackers. We ship things, break stuff, and learn together. Hackathons, open-source & late-night deploys.',
  memberCount: '1.2K',
  postCount: '348',
  activeNow: 24,
  tags: ['#WebDev', '#OpenSource', '#Hackathon', '#AI', '#React'],
  avatar: 'https://i.pravatar.cc/200?img=12',
  isVerified: true,

  // ── Set a URL to use a real photo, or null for animated blob background
  bannerImage: 'https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?w=900&q=80' as string | null,

  posts: Array.from({ length: 9 }, (_, i) => ({
    id: `p${i}`,
    uri: `https://picsum.photos/seed/post${i}/300/300`,
    pinned: i === 0,
  })),

  events: [
    { id: 'e1', title: 'Hackathon 2025', date: 'Apr 28', uri: 'https://picsum.photos/seed/ev1/300/300' },
    { id: 'e2', title: 'React Workshop', date: 'May 3', uri: 'https://picsum.photos/seed/ev2/300/300' },
    { id: 'e3', title: 'AI Study Jam', date: 'May 10', uri: 'https://picsum.photos/seed/ev3/300/300' },
    { id: 'e4', title: 'Open Source Day', date: 'May 17', uri: 'https://picsum.photos/seed/ev4/300/300' },
    { id: 'e5', title: 'Deploy Night', date: 'May 24', uri: 'https://picsum.photos/seed/ev5/300/300' },
    { id: 'e6', title: 'System Design', date: 'Jun 1', uri: 'https://picsum.photos/seed/ev6/300/300' },
  ],

  members: Array.from({ length: 9 }, (_, i) => ({
    id: `m${i}`,
    name: ['Aryan S.', 'Neha R.', 'Priya M.', 'Rohan K.', 'Aisha T.', 'Dev P.', 'Sana L.', 'Kiran J.', 'Mia V.'][i],
    role: i === 0 ? 'Admin' : i < 3 ? 'Mod' : 'Member',
    uri: `https://i.pravatar.cc/150?img=${i + 20}`,
  })),
};

const TABS = [
  { key: 'posts', icon: <MaterialIcons name="post-add" size={24} color="white" />, label: 'Posts' },
  { key: 'events', icon: <MaterialIcons name="event-note" size={24} color="white" />, label: 'Events' },
  { key: 'members', icon: <Ionicons name="people-sharp" size={24} color="white" />, label: 'Members' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

// ─────────────────────────────────────────────────────────────────────────────
//  Blob BG (used when bannerImage === null)
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
//  Grid cells
// ─────────────────────────────────────────────────────────────────────────────
function PostGrid({ items }: { items: typeof COMMUNITY.posts }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const scale = useRef(new Animated.Value(1)).current;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={1}
            onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
          >
            <Animated.View style={[styles.gridCell, { transform: [{ scale }] }]}>
              <Image source={{ uri: item.uri }} style={styles.gridImg} />
              {item.pinned && (
                <View style={styles.pinnedBadge}><Text style={{ fontSize: 10 }}>📌</Text></View>
              )}
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function EventGrid({ items }: { items: typeof COMMUNITY.events }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity key={item.id} activeOpacity={0.85}>
          <View style={styles.gridCell}>
            <Image source={{ uri: item.uri }} style={styles.gridImg} />
            <View style={styles.eventOverlay}>
              <View style={styles.eventDateBadge}><Text style={styles.eventDateTxt}>{item.date}</Text></View>
              <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MemberGrid({ items }: { items: typeof COMMUNITY.members }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity key={item.id} activeOpacity={0.85}>
          <View style={[styles.gridCell, styles.memberCell]}>
            <Image source={{ uri: item.uri }} style={styles.memberAvatar} />
            <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.roleBadge, item.role === 'Admin' && styles.roleAdmin, item.role === 'Mod' && styles.roleMod]}>
              <Text style={styles.roleText}>{item.role}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Tab bar
// ─────────────────────────────────────────────────────────────────────────────
function TabBar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.75}
          >
            <View style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            {isActive && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main screen
// ─────────────────────────────────────────────────────────────────────────────
export default function CommunityProfile() {
  const [activeTab, setActiveTab] = useState<TabKey>('posts');
  const fadeY = useRef(new Animated.Value(20)).current;
  const fade = useRef(new Animated.Value(0)).current;
   const router =useRouter();
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(fadeY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Full-screen background (absolute, covers everything) ── */}
      <View style={StyleSheet.absoluteFill}>
        {COMMUNITY.bannerImage ? (
          <Image
            source={{ uri: COMMUNITY.bannerImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
            <View></View>
        )}
        {/* Heavy dark gradient overlay so content is readable */}
      
        <View style={styles.bgOverlayBottom} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        style={{ flex: 1 }}
      >
        {/* ── Top bar (floating) ── */}
        <View style={styles.topBar}>
          <Pressable style={styles.circleBtn} onPress={()=>router.back()}>
            <Text style={styles.circleBtnIcon}>←</Text>
          </Pressable>
          <Pressable style={styles.circleBtn2}>
            <Text style={styles.circleBtnIcon}>⋯</Text>
          </Pressable>
        </View>

        {/* ── Hero spacer — enough room so text starts mid-screen ── */}
      

        {/* ── Avatar ── */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: COMMUNITY.avatar }} style={styles.avatar} />
          </View>
          <View style={styles.onlineDot} />
        </View>

        {/* ── Profile info ── */}
        <Animated.View style={[styles.profileBlock,  ]}>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{COMMUNITY.name}</Text>
            {COMMUNITY.isVerified && (
              <View style={styles.verifiedDot}>
                <Text style={styles.verifiedCheck}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.handle}>{COMMUNITY.handle}</Text>

          <View style={styles.uniChip}>
            <Text style={styles.uniText}>{COMMUNITY.university}</Text>
          </View>

          <View style={styles.activePill}>
            <View style={styles.activeDotSmall} />
            <Text style={styles.activeLabel}>{COMMUNITY.activeNow} active now</Text>
          </View>

          <Text style={styles.bio}>{COMMUNITY.bio}</Text>

          {/* Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
            {COMMUNITY.tags.map((t) => (
              <View key={t} style={styles.tag}><Text style={styles.tagTxt}>{t}</Text></View>
            ))}
          </ScrollView>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{COMMUNITY.memberCount}</Text>
              <Text style={styles.statLbl}>Members</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{COMMUNITY.postCount}</Text>
              <Text style={styles.statLbl}>Posts</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{COMMUNITY.activeNow}</Text>
              <Text style={styles.statLbl}>Online</Text>
            </View>
          </View>

          {/* CTAs */}
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.joinBtn} activeOpacity={0.85}>
              <Text style={styles.joinTxt}>Join Community</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.msgBtn} activeOpacity={0.75}>
              <Text style={styles.msgIcon}>💬</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Tab bar + content (sits on dark section) ── */}
        <View style={styles.contentSection}>
          <TabBar active={activeTab} onChange={setActiveTab} />

          {activeTab === 'posts' && <PostGrid items={COMMUNITY.posts} />}
          {activeTab === 'events' && <EventGrid items={COMMUNITY.events} />}
          {activeTab === 'members' && <MemberGrid items={COMMUNITY.members} />}
        </View>

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  // bg overlays

  bgOverlayBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,

    height: height ,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },

  // blob


  // top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    
  },
  circleBtn2: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent:'center'
  },
  circleBtnIcon: { color: '#fff', fontSize: 17, fontWeight: '600' },

  // avatar
  avatarWrap: { alignItems: 'center', marginBottom: 12, position: 'relative' },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  onlineDot: {
    position: 'absolute',
    bottom: 4, right: width / 2 - 47 - 2,
    width: 13, height: 13,
    borderRadius: 7,
    backgroundColor: '#1DB954',
    borderWidth: 2,
    borderColor: '#000',
  },

  // profile
  profileBlock: { alignItems: 'center', paddingHorizontal: 20 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.1 },
  verifiedDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#e8334a', alignItems: 'center', justifyContent: 'center',
  },
  verifiedCheck: { color: '#fff', fontSize: 10, fontWeight: '800' },

  handle: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 10, letterSpacing: 0.4 },

  uniChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  uniText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500', letterSpacing: 0.3 },

  activePill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  activeDotSmall: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#1DB954' },
  activeLabel: { color: '#1DB954', fontSize: 12, fontWeight: '600' },

  bio: {
    color: 'rgba(255,255,255,0.6)', fontSize: 13.5, lineHeight: 21,
    textAlign: 'center', marginBottom: 14, letterSpacing: 0.15,
  },

  tagsScroll: { flexDirection: 'row', gap: 7, paddingHorizontal: 4, marginBottom: 18 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  tagTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },

  statsRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14, marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLbl: { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '600', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' },
  statSep: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'center' },

  ctaRow: { flexDirection: 'row', width: '100%', gap: 10, marginBottom: 4 },
  joinBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  joinTxt: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
  msgBtn: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  msgIcon: { fontSize: 19 },

  // ── Content section (dark solid base for grid area)
  contentSection: {
    backgroundColor: '#000',
    marginTop: 24,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    // top border line
    borderTopWidth: 1,
    borderColor: '#1e1e1e',
  },

  // ── Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#000',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    position: 'relative',
  },
  tabIcon: { fontSize: 18, marginBottom: 2, opacity: 0.35 },
  tabIconActive: { opacity: 1 },
  tabLabel: { color: '#444', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  tabLabelActive: { color: '#fff' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0, left: '15%', right: '15%',
    height: 2,
    backgroundColor: 'white',
    borderRadius: 2,
  },

  // ── Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 },
  gridCell: { width: GRID_SIZE, height: GRID_SIZE, overflow: 'hidden', backgroundColor: '#111' },
  gridImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  pinnedBadge: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: 3,
  },

  // events overlay
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
    padding: 8,
    justifyContent: 'flex-end',
  },
  eventDateBadge: {
    backgroundColor: '#e8334a',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
    alignSelf: 'flex-start', marginBottom: 4,
  },
  eventDateTxt: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  eventTitle: { color: '#fff', fontSize: 11, fontWeight: '700', lineHeight: 14 },

  // members
  memberCell: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d', gap: 4 },
  memberAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#2a2a2a' },
  memberName: { color: '#ccc', fontSize: 11, fontWeight: '600', paddingHorizontal: 4 },
  roleBadge: {
    backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  roleAdmin: { backgroundColor: 'rgba(232,51,74,0.15)', borderColor: '#e8334a' },
  roleMod: { backgroundColor: 'rgba(29,185,84,0.12)', borderColor: '#1DB954' },
  roleText: { color: '#888', fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
});