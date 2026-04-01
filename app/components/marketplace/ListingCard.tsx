import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

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
const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED: { label:'active',  color: C.green,  bg: C.green  + '22' },
  SOLD:   { label: 'Sold',    color: C.muted,  bg: C.surface3       },
  PAUSED: { label: 'Paused',  color: C.yellow, bg: C.yellow + '22'  },
}


export function ListingCard({ item, onDelete }: { item: any; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const meta = STATUS_META[item?.item?.status]
  console.log(meta)
  const isSold = item.status === 'SOLD'
  console.log(item)
  

  return (
    <View style={{
      backgroundColor: C.surface2,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
    }}>
      <View style={{ flexDirection: 'row' }}>
 
        
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: item?.item?.coverImage }}
            style={{ width: 100, height: 100, opacity: isSold ? 0.4 : 1 }}
            contentFit="cover"
          />
          {isSold && (
            <View style={{
              position: 'absolute', inset: 0,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}>
              <Text style={{ color: C.white, fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>SOLD</Text>
            </View>
          )}
        </View>
 
        
        <View style={{ flex: 1, padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: C.white, fontSize: 14, fontWeight: '800', letterSpacing: -0.2 }} numberOfLines={1}>
                {item?.item?.productName}
              </Text>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                {item?.item?.categoryName} · {item?.item?.time}
              </Text>
            </View>
 
            
            <Pressable onPress={() => setMenuOpen(v => !v)} style={{ padding: 4 }}>
              <Ionicons name="ellipsis-vertical" size={15} color={C.muted} />
            </Pressable>
          </View>
 
        
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
            <Text style={{ color: C.white, fontSize: 16, fontWeight: '900' }}>
              ₹{item?.item.price}
            </Text>
            <View style={{ backgroundColor: meta.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ color: meta.color, fontSize: 10, fontWeight: '800' }}>{meta.label.toUpperCase()}</Text>
            </View>
            {item.offers > 0 && (
              <View style={{ backgroundColor: C.orange + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ color: C.orange, fontSize: 10, fontWeight: '800' }}>{item?.item?.offers} OFFER{item?.item.offers > 1 ? 'S' : ''}</Text>
              </View>
            )}
          </View>
 
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <StatPill icon="eye-outline" value={item?.item.views} />
            <StatPill icon="bookmark-outline" value={item?.item?.likes} />
          </View>
        </View>
      </View>
 
     
      {menuOpen && (
        <View style={{ borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row' }}>
          {[
            { icon: 'pencil-outline', label: 'Edit',   color: C.textSec },
            { icon: item.status === 'paused' ? 'play-outline' : 'pause-outline', label: item.status === 'paused' ? 'Reactivate' : 'Pause', color: C.yellow },
            { icon: 'trash-outline',  label: 'Delete', color: C.red },
          ].map((action, i, arr) => (
            <Pressable
              key={action.label}
              onPress={() => {
                if (action.label === 'Delete') onDelete(item.id)
                setMenuOpen(false)
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                borderRightWidth: i < arr.length - 1 ? 1 : 0,
                borderRightColor: C.border,
              }}
            >
              <Ionicons name={action.icon as any} size={14} color={action.color} />
              <Text style={{ color: action.color, fontSize: 12, fontWeight: '700' }}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}
function StatPill({ icon, value }: { icon: any; value: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={12} color={C.muted} />
      <Text style={{ color: C.muted, fontSize: 12, fontWeight: '600' }}>{value}</Text>
    </View>
  )
}