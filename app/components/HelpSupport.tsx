import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const C = {
  bg: '#0A0A0A',
  surface1: '#141414',
  surface2: 'black',
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
  teal: '#14B8A6',
}

const FAQ_ITEMS = [
  {
    q: 'How do I list an item for sale?',
    a: 'Tap the menu (⋮) in the header → "List Items". Fill in photos, title, description, category, condition, and price. Tap "Publish Listing" when done.',
  },
  {
    q: 'Is Campus Commerce only for Graphic Era students?',
    a: 'Yes — currently Campus Commerce is exclusively for verified Graphic Era University students. Your student email is used for verification.',
  },
  {
    q: 'How do I contact a seller?',
    a: 'Open any listing and tap the "Message" button. You can also see the seller\'s hostel block if they\'ve enabled it, to arrange in-person meetups.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Transactions are peer-to-peer. Most students use UPI (GPay, PhonePe, Paytm) or cash. We recommend meeting in a safe campus location.',
  },
  {
    q: 'How do I report a suspicious listing or user?',
    a: 'Open the listing and tap the flag (⚑) icon in the top-right corner. Our moderation team reviews all reports within 24 hours.',
  },
  {
    q: 'Why was my listing removed?',
    a: 'Listings that violate our guidelines (prohibited items, misleading info, duplicate posts) are removed. Check your email for the specific reason.',
  },
  {
    q: 'Can I sell non-academic items?',
    a: 'Yes — electronics, furniture, cycles, clothing, sports gear, and most personal items are allowed. See our full guidelines for the prohibited items list.',
  },
  {
    q: 'How long do listings stay active?',
    a: 'Listings are active for 30 days by default. You can extend, pause, or relist anytime from "My Listings". Enable Auto Re-list in Settings to do it automatically.',
  },
]

const QUICK_ACTIONS = [
  { icon: 'chatbubbles-outline', label: 'Live Chat', sub: 'Avg. reply < 5 min', color: C.green, action: 'chat' },
  { icon: 'mail-outline', label: 'Email Us', sub: 'support@campusco.in', color: C.blue, action: 'email' },
  { icon: 'logo-whatsapp', label: 'WhatsApp', sub: '+91 98765 00000', color: '#25D366', action: 'wa' },
  { icon: 'flag-outline', label: 'Report Issue', sub: 'Bug or abuse report', color: C.orange, action: 'report' },
]

const GUIDES = [
  { icon: 'storefront-outline', color: C.orange, title: 'Selling Your First Item', reading: '2 min read' },
  { icon: 'shield-checkmark-outline', color: C.green, title: 'Staying Safe on Campus', reading: '3 min read' },
  { icon: 'cash-outline', color: C.yellow, title: 'Payment Tips & UPI Guide', reading: '2 min read' },
  { icon: 'star-outline', color: C.purple, title: 'Building Your Reputation', reading: '4 min read' },
]

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQItem({ item, index }: { item: typeof FAQ_ITEMS[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: C.border }}>
      <Pressable
        onPress={() => setOpen(v => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 }}
      >
        <Text style={{ color: C.muted, fontSize: 12, fontWeight: '800', width: 24 }}>
          {String(index + 1).padStart(2, '0')}
        </Text>
        <Text style={{ flex: 1, color: C.white, fontSize: 14, fontWeight: '700', lineHeight: 20 }}>
          {item.q}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color={C.muted} style={{ marginLeft: 8 }} />
      </Pressable>
      {open && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingLeft: 40 }}>
          <Text style={{ color: C.textSec, fontSize: 13, lineHeight: 20, fontWeight: '500' }}>
            {item.a}
          </Text>
        </View>
      )}
    </View>
  )
}


export default function HelpSupportScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const filteredFAQ = FAQ_ITEMS.filter(f =>
    search === '' ||
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  const handleQuickAction = (action: string) => {
    if (action === 'email') Linking.openURL('mailto:support@campusco.in')
    if (action === 'wa') Linking.openURL('https://wa.me/919876500000')
  }

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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={18} color={C.textSec} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.white, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>Help & Support</Text>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 1 }}>We're here to help</Text>
          </View>
        </View>


        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: "#1A1A1A",
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: searchFocused ? C.white : C.border,
          paddingHorizontal: 14,
          paddingVertical: 11,
          gap: 10,
        }}>
          <Ionicons name="search-outline" size={16} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search FAQs, topics..."
            placeholderTextColor={C.muted}
            style={{ flex: 1, color: C.white, fontSize: 14, fontWeight: '500' }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={C.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>

        {/* ── Hero banner ── */}
        {search === '' && (
          <View style={{
            margin: 16,
            borderRadius: 20,
            backgroundColor: C.surface2,
            borderWidth: 1,
            borderColor: C.border,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
          }}>
            {/* Decorative circle */}
            <View style={{
              position: 'absolute', right: -20, top: -20,
              width: 120, height: 120, borderRadius: 60,
              backgroundColor: C.teal + '18',
            }} />
            <View style={{
              width: 50, height: 50, borderRadius: 25,
              backgroundColor: C.teal + '22',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 14,
            }}>
              <MaterialCommunityIcons name="headset" size={26} color={C.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.white, fontSize: 15, fontWeight: '900', letterSpacing: -0.3 }}>
                Campus Support Team
              </Text>
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 3, lineHeight: 17 }}>
                Student-run · Response time under 5 min
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.green }} />
                <Text style={{ color: C.green, fontSize: 11, fontWeight: '700' }}>Online now · 9 AM – 9 PM</Text>
              </View>
            </View>
          </View>
        )}


        {search === '' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>
              Contact Us
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {QUICK_ACTIONS.map(a => (
                <TouchableOpacity
                  key={a.label}
                  onPress={() => handleQuickAction(a.action)}
                  style={{
                    width: '47%',
                    backgroundColor: "black",
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: C.border,
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 12,
                    backgroundColor: a.color + '22',
                    alignItems: 'center', justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <Ionicons name={a.icon as any} size={18} color={a.color} />
                  </View>
                  <Text style={{ color: C.white, fontSize: 13, fontWeight: '800' }}>{a.label}</Text>
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{a.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}


        {search === '' && (
          <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>
              Guides
            </Text>
            <View style={{ gap: 8 }}>
              {GUIDES.map(g => (
                <TouchableOpacity
                  key={g.title}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: "black",
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: C.border,
                    gap: 14,
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: g.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={g.icon as any} size={18} color={g.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.white, fontSize: 14, fontWeight: '700' }}>{g.title}</Text>
                    <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{g.reading}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={C.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}


        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>
            {search ? `${filteredFAQ.length} result${filteredFAQ.length !== 1 ? 's' : ''} for "${search}"` : 'Frequently Asked Questions'}
          </Text>
          <View style={{ backgroundColor: C.surface2, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
            {filteredFAQ.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 36 }}>
                <Ionicons name="search-outline" size={32} color={C.muted} />
                <Text style={{ color: C.muted, fontSize: 14, fontWeight: '700', marginTop: 12 }}>No results found</Text>
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Try different keywords</Text>
              </View>
            ) : (
              filteredFAQ.map((item, i) => (
                <FAQItem key={i} item={item} index={i} />
              ))
            )}
          </View>
        </View>

        {/* ── Feedback ── */}
        {search === '' && (
          <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>
              Rate Your Experience
            </Text>
            <View style={{ backgroundColor: C.surface2, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 18 }}>
              {!feedbackSent ? (
                <>
                  <Text style={{ color: C.white, fontSize: 15, fontWeight: '800', marginBottom: 4 }}>
                    How's Campus Commerce working for you?
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>
                    Your feedback helps us improve
                  </Text>


                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Pressable key={star} onPress={() => setRating(star)}>
                        <Ionicons
                          name={star <= rating ? 'star' : 'star-outline'}
                          size={28}
                          color={star <= rating ? C.yellow : C.muted}
                        />
                      </Pressable>
                    ))}
                  </View>


                  <View style={{ backgroundColor: C.surface3, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginBottom: 14 }}>
                    <TextInput
                      value={feedbackText}
                      onChangeText={setFeedbackText}
                      placeholder="Tell us more (optional)..."
                      placeholderTextColor={C.muted}
                      multiline
                      numberOfLines={3}
                      style={{
                        color: C.white,
                        fontSize: 14,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        textAlignVertical: 'top',
                        minHeight: 72,
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    disabled={rating === 0}
                    onPress={() => setFeedbackSent(true)}
                    style={{
                      backgroundColor: rating > 0 ? C.teal : C.surface3,
                      paddingVertical: 13,
                      borderRadius: 50,
                      alignItems: 'center',
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: rating > 0 ? '#000' : C.muted, fontWeight: '900', fontSize: 14 }}>
                      Submit Feedback
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                  <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: C.green + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Ionicons name="checkmark-circle" size={30} color={C.green} />
                  </View>
                  <Text style={{ color: C.white, fontSize: 16, fontWeight: '900' }}>Thank you! 🎉</Text>
                  <Text style={{ color: C.muted, fontSize: 13, marginTop: 6, textAlign: 'center' }}>
                    Your feedback has been sent to our team
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}


        <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 32, paddingHorizontal: 16 }}>
          Campus Commerce · Graphic Era University{'\n'}Made with ♥ by students, for students
        </Text>

      </ScrollView>
    </View>
  )
}