import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


const C = {
  bg: '#0A0A0A',
  surface1: '#141414',
  surface2: '#1A1A1A',
  surface3: '#242424',
  border: '#2A2A2A',
  white: '#FFFFFF',
  textSec: '#B3B3B3',
  muted: '#535353',
  orange: '#FF4D4D',
  purple: '#5856D6',
  green: '#1DB954',
  yellow: '#F59E0B',
  blue: '#3B82F6',
  red: '#EF4444',
  pink: '#EC4899',
}


type SettingToggle = {
  kind: 'toggle'
  icon: string
  iconColor: string
  label: string
  sub: string
  key: string
}
type SettingNav = {
  kind: 'nav'
  icon: string
  iconColor: string
  label: string
  sub?: string
  value?: string
  danger?: boolean
}
type SettingItem = SettingToggle | SettingNav

type Section = {
  title: string
  items: SettingItem[]
}



function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{
      color: C.muted,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      marginTop: 28,
      marginBottom: 8,
      paddingHorizontal: 4,
    }}>
      {title}
    </Text>
  )
}

function ToggleRow({ item, value, onToggle }: { item: SettingToggle; value: boolean; onToggle: () => void }) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: "black",
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    }}>
      <View style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: item.iconColor + '22',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons name={item.icon as any} size={17} color={item.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.white, fontSize: 14, fontWeight: '700' }}>{item.label}</Text>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 1 }}>{item.sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}

        trackColor={{ false: C.surface3, true: "#3B82F6" + '88' }}
        thumbColor={value ? "#3B82F6" : C.muted}
        ios_backgroundColor={C.surface3}
      />
    </View>
  )
}

function NavRow({ item, isLast }: { item: SettingNav; isLast: boolean }) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "black",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: C.border,
      }}
      activeOpacity={0.6}
    >
      <View style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: item.danger ? C.red + '22' : item.iconColor + '22',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons name={item.icon as any} size={17} color={item.danger ? C.red : item.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: item.danger ? C.red : C.white, fontSize: 14, fontWeight: '700' }}>{item.label}</Text>
        {item.sub && <Text style={{ color: C.muted, fontSize: 12, marginTop: 1 }}>{item.sub}</Text>}
      </View>
      {item.value ? (
        <Text style={{ color: C.muted, fontSize: 13, marginRight: 8 }}>{item.value}</Text>
      ) : null}
      {!item.danger && <Ionicons name="chevron-forward" size={15} color={C.muted} />}
    </TouchableOpacity>
  )
}


export default function SettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push_messages: true,
    push_offers: true,
    push_price_drop: false,
    push_nearby: false,
    show_phone: false,
    show_hostel: true,
    dark_mode: true,
    compact_view: false,
    auto_relist: false,
  })

  const toggle = (key: string) => setToggles(prev => ({ ...prev, [key]: !prev[key] }))

  const SECTIONS: Section[] = [
    {
      title: 'Account',
      items: [
        { kind: 'nav', icon: 'person-outline', iconColor: C.blue, label: 'Edit Profile', sub: 'Name, photo, bio' },
        { kind: 'nav', icon: 'school-outline', iconColor: C.purple, label: 'Student Verification', sub: 'Verified · Graphic Era' },
        { kind: 'nav', icon: 'call-outline', iconColor: C.green, label: 'Contact Number', value: '+91 98765 XXXXX' },
        { kind: 'nav', icon: 'location-outline', iconColor: C.orange, label: 'Hostel / Location', value: 'Block C' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { kind: 'toggle', icon: 'chatbubble-outline', iconColor: C.blue, label: 'New Messages', sub: 'When a buyer messages you', key: 'push_messages' },
        { kind: 'toggle', icon: 'pricetag-outline', iconColor: C.green, label: 'Offers', sub: 'When someone makes an offer', key: 'push_offers' },
        { kind: 'toggle', icon: 'trending-down-outline', iconColor: C.pink, label: 'Price Drops', sub: 'On your saved items', key: 'push_price_drop' },
        { kind: 'toggle', icon: 'navigate-outline', iconColor: C.yellow, label: 'Nearby Listings', sub: 'Items posted near your hostel', key: 'push_nearby' },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { kind: 'toggle', icon: 'call-outline', iconColor: C.blue, label: 'Show Phone Number', sub: 'Visible to interested buyers', key: 'show_phone' },
        { kind: 'toggle', icon: 'home-outline', iconColor: C.purple, label: 'Show Hostel Block', sub: 'Helps buyers find you easily', key: 'show_hostel' },
        { kind: 'nav', icon: 'eye-off-outline', iconColor: C.muted, label: 'Blocked Users', sub: '0 users blocked' },
      ],
    },
    {
      title: 'Listings',
      items: [
        { kind: 'toggle', icon: 'refresh-outline', iconColor: C.orange, label: 'Auto Re-list', sub: 'Re-post expired listings automatically', key: 'auto_relist' },
        { kind: 'nav', icon: 'time-outline', iconColor: C.blue, label: 'Listing Duration', value: '30 days' },
        { kind: 'nav', icon: 'wallet-outline', iconColor: C.green, label: 'Payment Methods', sub: 'UPI, Cash' },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { kind: 'toggle', icon: 'moon-outline', iconColor: C.purple, label: 'Dark Mode', sub: 'Always on dark theme', key: 'dark_mode' },
        { kind: 'toggle', icon: 'grid-outline', iconColor: C.blue, label: 'Compact View', sub: 'Smaller listing cards', key: 'compact_view' },
        { kind: 'nav', icon: 'language-outline', iconColor: C.yellow, label: 'Language', value: 'English' },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        { kind: 'nav', icon: 'log-out-outline', iconColor: C.red, label: 'Sign Out', danger: true },
        { kind: 'nav', icon: 'trash-outline', iconColor: C.red, label: 'Delete Account', danger: true, sub: 'Permanently remove all data' },
      ],
    },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>


      <View style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        backgroundColor: C.bg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={18} color={C.textSec} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.white, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>Settings</Text>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 1 }}>Campus Commerce</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}>


        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: "black",
          borderRadius: 18,
          padding: 16,
          marginTop: 20,
          borderWidth: 1,
          borderColor: C.border,
          gap: 14,
        }}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: C.surface3 }}
            />
            <View style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 18, height: 18, borderRadius: 9,
              backgroundColor: C.green,
              borderWidth: 2, borderColor: C.surface2,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="checkmark" size={10} color="#000" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.white, fontSize: 16, fontWeight: '900', letterSpacing: -0.3 }}>Rahul Sharma</Text>
            <Text style={{ color: C.muted, fontSize: 12, fontWeight: '600', marginTop: 2 }}>3rd Year · CSE · Graphic Era</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <View style={{ backgroundColor: C.green + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ color: C.green, fontSize: 10, fontWeight: '800' }}>✓ VERIFIED</Text>
              </View>
              <Text style={{ color: C.muted, fontSize: 11 }}>4.8 ★ · 12 sales</Text>
            </View>
          </View>
          <Pressable style={{ padding: 6 }}>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </Pressable>
        </View>


        {SECTIONS.map((section) => {
          const toggleItems = section.items.filter((i): i is SettingToggle => i.kind === 'toggle')
          const navItems = section.items.filter((i): i is SettingNav => i.kind === 'nav')
          const isDanger = section.title === 'Danger Zone'

          return (
            <View key={section.title}>
              <SectionHeader title={section.title} />


              {toggleItems.length > 0 && (
                <View style={{ backgroundColor: C.surface2, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: navItems.length > 0 ? 8 : 0 }}>
                  {toggleItems.map((item, i) => (
                    <View key={item.key} style={{ borderBottomWidth: i < toggleItems.length - 1 ? 1 : 0, borderBottomColor: C.border }}>
                      <ToggleRow item={item} value={toggles[item.key]} onToggle={() => toggle(item.key)} />
                    </View>
                  ))}
                </View>
              )}


              {navItems.length > 0 && (
                <View style={{
                  backgroundColor: "black",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: C.border,
                  overflow: 'hidden',
                }}>
                  {navItems.map((item, i) => (
                    <NavRow key={item.label} item={item} isLast={i === navItems.length - 1} />
                  ))}
                </View>
              )}
            </View>
          )
        })}


        <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 32 }}>
          Campus Commerce v1.0.0 · Graphic Era University
        </Text>

      </ScrollView>
    </View>
  )
}