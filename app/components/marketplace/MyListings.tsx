import {  useGetSellerDashboardQuery } from '@/src/features/marketplace.api'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ListingCard } from './ListingCard'
import { FlatList } from 'react-native-gesture-handler'
 

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
  red: '#EF4444',
  blue: '#3B82F6',
}

const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'MacBook Pro 2021 M1',
    price: 72000,
    category: 'Electronics',
    condition: 'Like New',
    conditionColor: C.blue,
    status: 'active',
    views: 142,
    saves: 18,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    daysAgo: 2,
    offers: 3,
  },
  {
    id: '2',
    title: 'Engineering Mathematics Vol 1 & 2',
    price: 350,
    category: 'Books',
    condition: 'Good',
    conditionColor: C.yellow,
    status: 'active',
    views: 56,
    saves: 7,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    daysAgo: 5,
    offers: 1,
  },
  {
    id: '3',
    title: 'Adidas Campus Shoes Size 10',
    price: 2800,
    category: 'Clothing',
    condition: 'Good',
    conditionColor: C.yellow,
    status: 'sold',
    views: 203,
    saves: 24,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    daysAgo: 12,
    offers: 0,
  },
  {
    id: '4',
    title: 'Study Lamp + USB Hub Combo',
    price: 1100,
    category: 'Electronics',
    condition: 'Like New',
    conditionColor: C.blue,
    status: 'paused',
    views: 34,
    saves: 4,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80',
    daysAgo: 8,
    offers: 0,
  },
  {
    id: '5',
    title: 'Calculus by Thomas & Finney',
    price: 180,
    category: 'Books',
    condition: 'Fair',
    conditionColor: C.orange,
    status: 'active',
    views: 29,
    saves: 2,
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80',
    daysAgo: 1,
    offers: 0,
  },
]
 
const STATUS_TABS = ['All', 'Active', 'Sold', 'Paused'] as const
type StatusTab = typeof STATUS_TABS[number]
 


export default function MyListingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<StatusTab>('All')
  const [listings, setListings] = useState(MOCK_LISTINGS)
  
  const filtered = activeTab === 'All'
    ? listings
    : listings.filter(l => l.status === activeTab.toLowerCase())
 
  const stats = {
    total:  listings.length,
    active: listings.filter(l => l.status === 'active').length,
    sold:   listings.filter(l => l.status === 'sold').length,
    views:  listings.reduce((s, l) => s + l.views, 0),
  }

  const {data:sellerDashboardData,isLoading:sellerDashboardLoading,error:sellerDashboardError}=useGetSellerDashboardQuery({listingStatus:activeTab.toUpperCase(),cursor:undefined})
  const handleDelete = (id: string) => setListings(prev => prev.filter(l => l.id !== id))
   console.log(sellerDashboardData,sellerDashboardError)
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
            <Text style={{ color: C.white, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>My Listings</Text>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 1 }}>Graphic Era University</Text>
          </View>
          <Pressable
            onPress={() => router.push('/components/marketplace/AddItem')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.orange, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
          >
            <Ionicons name="add" size={16} color={C.white} />
            <Text style={{ color: C.white, fontWeight: '800', fontSize: 13 }}>New</Text>
          </Pressable>
        </View>
 
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total',  value:sellerDashboardData?.stats?.totalProducts,  color: C.textSec },
            { label: 'Active', value:sellerDashboardData?. stats?.activeProducts, color: C.green   },
            { label: 'Sold',   value: sellerDashboardData?.stats?.soldProducts,   color: C.muted   },
            { label: 'Views',  value: sellerDashboardData?.stats?.totalViews,  color: C.blue    },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: C.surface2, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: s.color, fontSize: 18, fontWeight: '900' }}>{s.value}</Text>
              <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', marginTop: 2 }}>{s.label.toUpperCase()}</Text>
            </View>
          ))}
        </View>
 
      
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {STATUS_TABS.map(tab => {
              const isActive = activeTab === tab
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isActive ? C.white : C.surface2,
                    borderWidth: 1,
                    borderColor: isActive ? C.white : C.border,
                  }}
                >
                  <Text style={{ color: isActive ? C.bg : C.textSec, fontWeight: '800', fontSize: 13 }}>{tab}</Text>
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
      </View>
 
    
      <View
        style={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      >
        {sellerDashboardData?.products.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MaterialCommunityIcons name="storefront-outline" size={48} color={C.muted} />
            <Text style={{ color: C.muted, fontSize: 15, fontWeight: '700', marginTop: 14 }}>No {activeTab.toLowerCase()} listings</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>Tap "New" to create one</Text>
          </View>
        ) : (
          <FlatList data={sellerDashboardData?.products}  keyExtractor={(item)=>item.productId.toString()} renderItem={(item)=>( <ListingCard  item={item} onDelete={handleDelete} />)}></FlatList>
           
          )
        }
      </View>
    </View>
  )
}