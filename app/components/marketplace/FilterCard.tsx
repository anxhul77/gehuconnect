import { FontAwesome, Octicons } from '@expo/vector-icons'
import { useRef, useState } from 'react'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import OptionRow from './OptionRow'

const ORDER_OPTIONS = [
  { id: 'asc', label: 'Ascending', icon: '↑' },
  { id: 'desc', label: 'Descending', icon: '↓' },
]

const SORTBY_OPTIONS = [
  { id: 'price', label: 'Price', icon: '$' },
  { id: 'rating', label: 'Rating', icon: '★' },
  { id: 'createdAt', label: 'Time', icon: '⏱' },
]

const POPOVER_WIDTH = 180

type SortState = {
  order: string | null
  by: string | null
}

type Props = {
  sort: SortState
  onSortChange: (sort: SortState) => void
}






export default function FilterCard({ sort, onSortChange }: Props) {
  const [visible, setVisible] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<View>(null)

  const handlePress = () => {
    btnRef.current?.measureInWindow((x, y, width, height) => {
      setPopoverPos({
        top: y + height + 8,
        right: x + POPOVER_WIDTH,
      })
      setVisible(true)
    })
  }


  const toggleOrder = (id: string) =>
    onSortChange({ ...sort, order: sort.order === id ? null : id })

  const toggleBy = (id: string) =>
    onSortChange({ ...sort, by: sort.by === id ? null : id })

  const isActive = sort.order || sort.by

  return (
    <>

      <View
        ref={btnRef}
        className=" h-10 w-10 absolute left-0 items-center justify-center"
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className="h-10 w-10 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]"
        >
          <Octicons name="sliders" size={20} color="white" />
          {isActive && (
            <View className="absolute -top-1 -right-1 bg-white rounded-full w-2 h-2" />
          )}
        </Pressable>
      </View>


      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <Pressable onPress={() => setVisible(false)} className="flex-1">
          <Pressable
            onPress={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: popoverPos.top,
              right: popoverPos.right,
              width: POPOVER_WIDTH,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 12,
            }}
            className="bg-black border border-[#2A2A2A] rounded-2xl overflow-hidden"
          >

            <View className="px-4 pt-3 pb-1.5">
              <Text className="text-[10px] font-semibold tracking-widest uppercase text-[#555]">
                Order
              </Text>
            </View>

            {ORDER_OPTIONS.map((opt, index) => (
              <OptionRow
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                active={sort.order === opt.id}
                isLast={index === ORDER_OPTIONS.length - 1}
                onPress={() => toggleOrder(opt.id)}
              />
            ))}

            <View className="h-px bg-[#2A2A2A]" />


            <View className="px-4 pt-3 pb-1.5">
              <Text className="text-[10px] font-semibold tracking-widest uppercase text-[#555]">
                Sort by
              </Text>
            </View>

            {SORTBY_OPTIONS.map((opt, index) => (
              <OptionRow
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                active={sort.by === opt.id}
                isLast={index === SORTBY_OPTIONS.length - 1}
                onPress={() => toggleBy(opt.id)}
              />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}