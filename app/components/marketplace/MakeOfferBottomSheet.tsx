import  { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, BackHandler, Keyboard } from 'react-native'
import BottomSheet, {
  BottomSheetView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'

interface Props {
  listedPrice?: number
  onSendOffer?: (amount: number, note: string) => void
  onClose?: () => void
}

const DISCOUNTS = [
  { label: '-5%', multiplier: 0.95 },
  { label: '-10%', multiplier: 0.9 },
  { label: '-15%', multiplier: 0.85 },
]

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

const MakeOfferBottomSheet = forwardRef<BottomSheet, Props>(
  ({ listedPrice = 45000, onSendOffer, onClose }, ref) => {
    const snapPoints = useMemo(() => ['62%'], [])
    const [offer, setOffer] = useState('')
    const [note, setNote] = useState('')
    const sheetIndexRef = useRef(-1)

    const num = parseInt(offer, 10)
    const valid = !isNaN(num) && num > 0
    const saving = valid && num < listedPrice ? listedPrice - num : null

    useEffect(() => {
      const hideSub = Keyboard.addListener('keyboardDidHide', () => {
        if (sheetIndexRef.current >= 0 && typeof ref !== 'function') {
          ref?.current?.snapToIndex(0)
        }
      })
      const back = BackHandler.addEventListener('hardwareBackPress', () => {
        if (sheetIndexRef.current >= 0 && typeof ref !== 'function') {
          ref?.current?.close()
          return true
        }
        return false
      })
      return () => { hideSub.remove(); back.remove() }
    }, [])

    const renderBackdrop = useCallback((p: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...p} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} pressBehavior="close" />
    ), [])

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
          enableDynamicSizing={false}
        animateOnMount={false}
        backdropComponent={renderBackdrop}
        onClose={onClose}
        onChange={(i) => { sheetIndexRef.current = i }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableContentPanningGesture={false}
        containerStyle={{ backgroundColor: 'transparent' }}
        handleIndicatorStyle={{ backgroundColor: '#535353', width: 36 }}
        backgroundStyle={{ backgroundColor: '#121212', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <BottomSheetView className="px-6 pt-2 pb-8">

          {/* Header */}
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">Make an Offer</Text>
              <Text className="text-[#B3B3B3] text-sm mt-0.5">
                Listed at <Text className="text-white font-semibold">{fmt(listedPrice)}</Text>
              </Text>
            </View>
            <View className="bg-[#1DB95422] border border-[#1DB95455] rounded-full px-3 py-1">
              <Text className="text-[#1DB954] text-[10px] font-bold tracking-widest">NEGOTIATE</Text>
            </View>
          </View>

          <View className="h-px bg-[#2A2A2A] mb-5" />

        
          <Text className="text-[#535353] text-[10px] font-bold tracking-widest mb-2">YOUR OFFER (₹)</Text>
          <View className="flex-row items-center bg-[#242424] rounded-lg border border-[#2A2A2A] px-4 h-14">
            <Text className="text-[#B3B3B3] text-lg font-semibold mr-1.5">₹</Text>
            <BottomSheetTextInput
              style={{ flex: 1, color: 'white', fontSize: 20, fontWeight: '600' }}
              value={offer}
              onChangeText={setOffer}
              placeholder="Enter amount"
              placeholderTextColor="#535353"
              keyboardType="numeric"
              returnKeyType="done"
            />
            {offer.length > 0 && (
              <Pressable onPress={() => setOffer('')} className="p-1">
                <Text className="text-[#535353] text-sm">✕</Text>
              </Pressable>
            )}
          </View>

          {saving ? (
            <Text className="text-[#1DB954] text-xs font-semibold mt-1.5 ml-0.5">
              You save {fmt(saving)} ({((saving / listedPrice) * 100).toFixed(0)}% off)
            </Text>
          ) : null}

    
          <View className="flex-row gap-2 mt-3">
            {DISCOUNTS.map(({ label, multiplier }) => {
              const amt = Math.round(listedPrice * multiplier)
              const selected = offer === String(amt)
              return (
                <Pressable
                  key={label}
                  onPress={() => setOffer(String(amt))}
                  className={`flex-1 rounded-lg border py-2.5 items-center ${selected ? 'bg-[#1DB9541A] border-[#1DB954]' : 'bg-[#242424] border-[#2A2A2A]'}`}
                >
                  <Text className={`text-xs font-bold ${selected ? 'text-[#1DB954]' : 'text-[#B3B3B3]'}`}>{label}</Text>
                  <Text className={`text-[11px] mt-0.5 ${selected ? 'text-[#1DB954CC]' : 'text-[#535353]'}`}>{fmt(amt)}</Text>
                </Pressable>
              )
            })}
          </View>

          <Text className="text-[#535353] text-[10px] font-bold tracking-widest mt-5 mb-2">
            ADD A NOTE <Text className="font-normal">(OPTIONAL)</Text>
          </Text>
          <BottomSheetTextInput
            style={{ backgroundColor: '#242424', borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', color: 'white', fontSize: 14, padding: 12, minHeight: 80, textAlignVertical: 'top' }}
            value={note}
            onChangeText={setNote}
            placeholder="E.g. I can pick up today..."
            placeholderTextColor="#535353"
            multiline
          />

         
          <Pressable
            onPress={() => valid && onSendOffer?.(num, note)}
            disabled={!valid}
            className={`h-14 rounded-full justify-center items-center mt-5 bg-[#1DB954] ${!valid ? 'opacity-35' : ''}`}
          >
            <Text className="text-black text-[15px] font-bold tracking-wide">
              {valid ? `Send Offer · ${fmt(num)}` : 'Send Offer'}
            </Text>
          </Pressable>

          <Text className="text-[#535353] text-[11px] text-center mt-3 leading-4">
            The seller can accept, decline, or counter your offer.
          </Text>

        </BottomSheetView>
      </BottomSheet>
    )
  }
)

MakeOfferBottomSheet.displayName = 'MakeOfferBottomSheet'
export default MakeOfferBottomSheet