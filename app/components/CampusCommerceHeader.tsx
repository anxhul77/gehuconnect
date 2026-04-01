import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const C = {
  bg: '#0A0A0A',
  accent: '#FF6B35',
  purple: '#5856D6',
  orange: '#FF4D4D',
  white: '#FFFFFF',
  muted: '#535353',
  textSec: '#B3B3B3',
  surface2: '#242424',
  border: '#2A2A2A',
}

const MENU_ITEMS = [
  { icon: 'bookmark-outline', label: 'Saved Items',   route: 'components/marketplace/SavedItems'           },
  { icon: 'receipt-outline',  label: 'List Items',    route: '/components/marketplace/AddItem'   },  
  { icon: 'storefront-outline',label: 'My Listings',  route:  '/components/marketplace/MyListings'         },
  { icon: 'settings-outline', label: 'Settings',      route: '/components/Settings'           },
  { icon: 'help-circle-outline',label: 'Help & Support', route: '/components/HelpSupport'        },
]

export default function CampusCommerceHeader({ headerHeight }: any) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<'Marketplace' | 'Housing'>('Marketplace')
  const [menuVisible, setMenuVisible] = useState(false)

  const handleMenuPress = (route: string | null) => {
    setMenuVisible(false)
    console.log("router",route)
    if (route) router.push(route as any)
  }

  return (
    <View style={{ paddingTop: insets.top + 8, height: headerHeight }}>

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, marginBottom: 14 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
        >
          <Ionicons name="arrow-back" color={C.textSec} size={18} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={{ color: C.white, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>
            Campus Commerce
          </Text>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 1 }}>
            Graphic Era University · P2P
          </Text>
        </View>

        <Pressable
          onPress={() => setMenuVisible(true)}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={C.textSec} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 16, marginHorizontal: 4, height: 48 }}>
        {(['Marketplace', 'Housing'] as const).map((tab) => {
          const isActive = activeTab === tab
          const activeColor = tab === 'Marketplace' ? C.orange : C.purple

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? activeColor : 'transparent',
              }}
            >
              <MaterialCommunityIcons
                name={tab === 'Marketplace' ? 'cart-outline' : 'home-modern'}
                size={16}
                color={isActive ? C.white : C.muted}
              />
              <Text style={{ color: isActive ? C.white : C.muted, fontWeight: '800', fontSize: 13, marginLeft: 6 }}>
                {tab}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
          <View
            style={{
              position: 'absolute',
              top: insets.top + 52,
              right: 12,
              backgroundColor: 'black',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.border,
              paddingVertical: 6,
              minWidth: 200,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => handleMenuPress(item.route)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderBottomWidth: index < MENU_ITEMS.length - 1 ? 1 : 0,
                  borderBottomColor: C.border,
                }}
              >
                <Ionicons name={item.icon as any} size={18} color={item.route ? C.white : C.textSec} style={{ marginRight: 12 }} />
                <Text style={{ color: C.textSec, fontSize: 14, fontWeight: item.route ? '700' : '600' }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

    </View>
  )
}