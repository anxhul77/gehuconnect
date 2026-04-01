import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
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
  pink: '#EC4899',
}


const MOCK_SAVED = [
  {
    id: '1',
    title: 'MacBook Pro 2021 M1',
    price: 72000,
    originalPrice: 85000,
    seller: 'Aryan S.',
    sellerYear: '3rd Year',
    category: 'Electronics',
    condition: 'Like New',
    conditionColor: C.blue,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    savedDaysAgo: 1,
    isNegotiable: true,
    isUrgent: false,
    tags: ['apple', 'laptop', 'm1'],
  },
  {
    id: '2',
    title: 'Giant Escape 3 Cycle',
    price: 11500,
    originalPrice: null,
    seller: 'Priya M.',
    sellerYear: '2nd Year',
    category: 'Sports',
    condition: 'Good',
    conditionColor: C.yellow,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80',
    savedDaysAgo: 3,
    isNegotiable: true,
    isUrgent: true,
    tags: ['cycle', 'giant'],
  },
  {
    id: '3',
    title: 'IKEA Study Table + Chair',
    price: 4200,
    originalPrice: 6500,
    seller: 'Rishi K.',
    sellerYear: 'Final Year',
    category: 'Furniture',
    condition: 'Good',
    conditionColor: C.yellow,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    savedDaysAgo: 5,
    isNegotiable: false,
    isUrgent: true,
    tags: ['furniture', 'ikea', 'study'],
  },
  {
    id: '4',
    title: 'Sony WH-1000XM4 Headphones',
    price: 14500,
    originalPrice: 18000,
    seller: 'Neha R.',
    sellerYear: '4th Year',
    category: 'Electronics',
    condition: 'Like New',
    conditionColor: C.blue,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    savedDaysAgo: 2,
    isNegotiable: true,
    isUrgent: false,
    tags: ['sony', 'headphones', 'anc'],
  },
  {
    id: '5',
    title: 'Casio FX-991ES Scientific Calculator',
    price: 650,
    originalPrice: null,
    seller: 'Dev P.',
    sellerYear: '1st Year',
    category: 'Stationery',
    condition: 'Brand New',
    conditionColor: C.green,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
    savedDaysAgo: 7,
    isNegotiable: false,
    isUrgent: false,
    tags: ['calculator', 'casio'],
  },
]

const FILTER_TABS = ['All', 'Electronics', 'Books', 'Furniture', 'Sports'] as const
type FilterTab = typeof FILTER_TABS[number]

const SORT_OPTIONS = ['Recently Saved', 'Price: Low to High', 'Price: High to Low'] as const
type SortOption = typeof SORT_OPTIONS[number]

function SavedCard({ item, onUnsave }: { item: typeof MOCK_SAVED[0]; onUnsave: (id: string) => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handleUnsave = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0,    duration: 200, useNativeDriver: true }),
    ]).start(() => onUnsave(item.id))
  }

  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 12 }}>
      <View style={{
        backgroundColor: C.surface2,
        borderTopLeftRadius: 16,
         borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: item.isUrgent ? C.orange + '44' : C.border,
        overflow: 'hidden',
        flexDirection: 'row',
      }}>
      
        {item.isUrgent && (
          <View style={{ width: 3, backgroundColor: C.orange }} />
        )}

     
        <Image source={{ uri: item.image }} style={{ width: 96, height: 96 }} resizeMode="cover" />

       
        <View style={{ flex: 1, padding: 12 }}>
         
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: C.white, fontSize: 14, fontWeight: '800', letterSpacing: -0.2 }} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                {item.seller} · {item.sellerYear}
              </Text>
            </View>

        
            <Pressable onPress={handleUnsave} style={{ padding: 2 }}>
              <Ionicons name="heart" size={18} color={C.pink} />
            </Pressable>
          </View>

        
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
            <Text style={{ color: C.white, fontSize: 16, fontWeight: '900' }}>
              ₹{item.price.toLocaleString('en-IN')}
            </Text>
            {item.originalPrice && (
              <Text style={{ color: C.muted, fontSize: 12, textDecorationLine: 'line-through' }}>
                ₹{item.originalPrice.toLocaleString('en-IN')}
              </Text>
            )}
            {discount && (
              <View style={{ backgroundColor: C.green + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ color: C.green, fontSize: 10, fontWeight: '800' }}>{discount}% OFF</Text>
              </View>
            )}
          </View>

      
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <View style={{ backgroundColor: item.conditionColor + '22', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ color: item.conditionColor, fontSize: 10, fontWeight: '700' }}>{item.condition}</Text>
            </View>
            {item.isNegotiable && (
              <View style={{ backgroundColor: C.purple + '22', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ color: C.purple, fontSize: 10, fontWeight: '700' }}>Negotiable</Text>
              </View>
            )}
            {item.isUrgent && (
              <View style={{ backgroundColor: C.orange + '22', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ color: C.orange, fontSize: 10, fontWeight: '700' }}>Urgent</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      
      <View style={{
        flexDirection: 'row',
        backgroundColor:"black",
        marginTop: -1,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: item.isUrgent ? C.orange + '44' : C.border,
        overflow: 'hidden',
      }}>
        <TouchableOpacity style={{ flex: 1, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderRightWidth: 1, borderRightColor: C.border }}>
          <MaterialCommunityIcons name="message-outline" size={14} color={C.textSec} />
          <Text style={{ color: C.textSec, fontSize: 12, fontWeight: '700' }}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Ionicons name="eye-outline" size={14} color={C.blue} />
          <Text style={{ color: C.blue, fontSize: 12, fontWeight: '700' }}>View Listing</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}


export default function SavedItemsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [filterTab, setFilterTab] = useState<FilterTab>('All')
  const [sortBy, setSortBy] = useState<SortOption>('Recently Saved')
  const [showSort, setShowSort] = useState(false)
  const [saved, setSaved] = useState(MOCK_SAVED)

  const handleUnsave = (id: string) => setSaved(prev => prev.filter(s => s.id !== id))

  const filtered = saved.filter(s =>
    filterTab === 'All' ? true : s.category === filterTab
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Price: Low to High')  return a.price - b.price
    if (sortBy === 'Price: High to Low')  return b.price - a.price
    return a.savedDaysAgo - b.savedDaysAgo
  })

  const totalValue = saved.reduce((s, i) => s + i.price, 0)
  const totalSavings = saved.reduce((s, i) => s + (i.originalPrice ? i.originalPrice - i.price : 0), 0)

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

     
      <View style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        backgroundColor: C.bg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={18} color={C.textSec} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.white, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>Saved Items</Text>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 1 }}>
              {saved.length} item{saved.length !== 1 ? 's' : ''} saved
            </Text>
          </View>
       
          <Pressable
            onPress={() => setShowSort(v => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: showSort ? C.white : C.border }}
          >
            <Ionicons name="funnel-outline" size={13} color={showSort ? C.white : C.textSec} />
            <Text style={{ color: showSort ? C.white : C.textSec, fontWeight: '700', fontSize: 12 }}>Sort</Text>
          </Pressable>
        </View>

       
        {showSort && (
          <View style={{ backgroundColor: C.surface3, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 14, overflow: 'hidden' }}>
            {SORT_OPTIONS.map((opt, i) => (
              <Pressable
                key={opt}
                onPress={() => { setSortBy(opt); setShowSort(false) }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: i < SORT_OPTIONS.length - 1 ? 1 : 0,
                  borderBottomColor: C.border,
                }}
              >
                <Text style={{ color: sortBy === opt ? C.white : C.textSec, fontWeight: sortBy === opt ? '800' : '600', fontSize: 13 }}>
                  {opt}
                </Text>
                {sortBy === opt && <Ionicons name="checkmark" size={16} color={C.white} />}
              </Pressable>
            ))}
          </View>
        )}

  
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: C.surface2, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700' }}>TOTAL VALUE</Text>
            <Text style={{ color: C.white, fontSize: 16, fontWeight: '900', marginTop: 3 }}>
              ₹{totalValue.toLocaleString('en-IN')}
            </Text>
          </View>
          {totalSavings > 0 && (
            <View style={{ flex: 1, backgroundColor: C.green + '15', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: C.green + '33' }}>
              <Text style={{ color: C.green, fontSize: 10, fontWeight: '700' }}>POTENTIAL SAVINGS</Text>
              <Text style={{ color: C.green, fontSize: 16, fontWeight: '900', marginTop: 3 }}>
                ₹{totalSavings.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </View>


        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FILTER_TABS.map(tab => {
              const isActive = filterTab === tab
              return (
                <Pressable
                  key={tab}
                  onPress={() => setFilterTab(tab)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isActive ? C.pink : C.surface2,
                    borderWidth: 1,
                    borderColor: isActive ? C.pink : C.border,
                  }}
                >
                  <Text style={{ color: isActive ? C.white : C.textSec, fontWeight: '800', fontSize: 13 }}>{tab}</Text>
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
      </View>

 
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      >
        {sorted.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="heart-outline" size={48} color={C.muted} />
            <Text style={{ color: C.muted, fontSize: 15, fontWeight: '700', marginTop: 14 }}>
              {filterTab === 'All' ? 'No saved items yet' : `No saved ${filterTab} items`}
            </Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>Tap ♡ on any listing to save it</Text>
          </View>
        ) : (
          sorted.map(item => (
            <SavedCard key={item.id} item={item} onUnsave={handleUnsave} />
          ))
        )}
      </ScrollView>
    </View>
  )
}