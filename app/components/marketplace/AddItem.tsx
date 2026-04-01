import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import StyledInput from './StyledInput'
import SectionLabel from './SectionLabel'
import { uploadToR2 } from '@/src/utils/UploadToR2'
import { useGetPresignedForProductsMutation } from '@/src/features/media.api'
import { useGetCategoriesQuery } from '@/src/features/category.api'
import { useAddProductsMutation, useGetProductConditionsQuery } from '@/src/features/marketplace.api'
import { CreateProductRequest, ListingStatus } from '@/src/types/types'
import Toast, { ErrorToast } from "react-native-toast-message"
import CategoryCardLoader from './CategoryCardLoader'

export default function ListItemScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)

  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [isNegotiable, setIsNegotiable] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [btnLoader,setBtnLoader]=useState<boolean>(false)

  const [hasDiscount, setHasDiscount] = useState(false)
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage')
  const [discountValue, setDiscountValue] = useState('')

  
  const originalPrice = parseFloat(price) || 0
  const discountAmt = parseFloat(discountValue) || 0
  const discountedPrice =
    hasDiscount && discountAmt > 0 && originalPrice > 0
      ? discountType === 'percentage'
        ? Math.max(0, originalPrice - (originalPrice * discountAmt) / 100)
        : Math.max(0, originalPrice - discountAmt)
      : null
  const savings = discountedPrice !== null ? originalPrice - discountedPrice : 0

  const completionScore = [
    images.length > 0,
    title.length > 3,
    description.length > 10,
    price.length > 0,
    category !== '',
    condition !== '',
  ].filter(Boolean).length

  const canPublish = completionScore === 6
  const progressPct = Math.round((completionScore / 6) * 100)

  const { data: categories ,isLoading:categoryLoading,error:categoryError} = useGetCategoriesQuery()
  const { data: productConditions,isLoading:productConditionsLoading,error:productConditionError } = useGetProductConditionsQuery()
  const [getPresigned] = useGetPresignedForProductsMutation()
  const [addProduct]=useAddProductsMutation();
 
 
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri).slice(0, 5)
      setImages(prev => [...prev, ...uris].slice(0, 5))
    }
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t) && tags.length < 6) {
      setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t))

  const handlePublish = async () => {
    setBtnLoader(true)
    try {
      if (images.length === 0) return
      const metadata = await Promise.all(
        images.map(async uri => {
          const res = await fetch(uri)
          const blob = await res.blob()
          return { mimeType: blob.type || 'image/jpeg', fileSize: blob.size }
        })
      )
      const presignedList = await getPresigned({ data: metadata }).unwrap()
    
      await Promise.all(
        presignedList.map((item, i) =>{
          uploadToR2(item.presignedUrl, images[i], metadata[i].mimeType)
        
        }
        )
      )
       const keys = presignedList.map(item => item.key)
       console.log("keys",keys)
     const createProductRequest: CreateProductRequest = {
      productName: title,
      quantity: 1,
      description,
      price: Number(price),
      image: keys,
      discount: discountAmt || 0,
      status:ListingStatus.PUBLISHED,
      isNegotitable: isNegotiable,
      isUrgentSale: isUrgent,
      tags,
      productConditionId: Number(condition)
    }

    await addProduct({
      createProductRequest,
      categoryId: category
    }).unwrap()
      Toast.show({
        type:'success',
        text1:"Item Added Succesfully",
         position:"top",
         visibilityTime:4000
      })
      setBtnLoader(false)
      router.back()
    } catch (err) {
      console.log(err)
      Toast.show(
        {type:"error",
          text1:'Something went wrong',
        position:"top",
         visibilityTime:4000})

    }
    setBtnLoader(false)
  }

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      
        <View
          className="bg-[#0A0A0A] border-b border-[#2A2A2A] px-4 pb-[14px]"
          style={{ paddingTop: insets.top + 10 }}
        >
          <View className="flex-row items-center mb-[14px]">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-[#1A1A1A] items-center justify-center mr-3"
            >
              <Ionicons name="close" size={18} color="#B3B3B3" />
            </Pressable>

            <View className="flex-1">
              <Text className="text-white text-[17px] font-black tracking-tight">New Listing</Text>
              <Text className="text-[#535353] text-[11px] font-semibold mt-px">
                {completionScore}/6 fields complete
              </Text>
            </View>

            <Pressable
              disabled={!canPublish}
              onPress={handlePublish}
              className={`px-[18px] py-[9px] rounded-full flex-row items-center gap-1.5 ${
                canPublish ? 'bg-[#1DB954]' : 'bg-[#242424]'
              }`}
            >
              <Ionicons name="checkmark" size={15} color={canPublish ? '#000' : '#535353'} />
              <Text className={`font-extrabold text-[13px] ${canPublish ? 'text-black' : 'text-[#535353]'}`}>
                Publish
              </Text>
            </Pressable>
          </View>

          <View className="h-[3px] bg-[#242424] rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${completionScore === 6 ? 'bg-[#1DB954]' : 'bg-[#3B82F6]'}`}
              style={{ width: `${progressPct}%` }}
            />
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
        >
        
          <SectionLabel>Photos</SectionLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-1">
            <Pressable
              onPress={pickImage}
              className="w-[100px] h-[100px] rounded-2xl bg-[#1A1A1A] border-[1.5px] border-dashed border-[#2A2A2A] items-center justify-center mr-2.5"
            >
              <Ionicons name="add" size={26} color="#535353" />
              <Text className="text-[#535353] text-[10px] font-semibold mt-1">
                {images.length}/5
              </Text>
            </Pressable>

            {images.map((uri, i) => (
              <View key={uri} className="mr-2.5 relative">
                <Image
                  source={{ uri }}
                  className="w-[100px] h-[100px] rounded-2xl"
                  resizeMode="cover"
                />
                {i === 0 && (
                  <View className="absolute bottom-1.5 left-1.5 bg-[#1DB954] rounded-md px-1.5 py-0.5">
                    <Text className="text-black text-[9px] font-black">COVER</Text>
                  </View>
                )}
                <Pressable
                  onPress={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-[22px] h-[22px] rounded-full bg-black/70 items-center justify-center"
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
          <Text className="text-[#535353] text-[11px] font-medium mt-1.5">
            First photo becomes the cover · Up to 5 photos
          </Text>

         
          <SectionLabel>Item Details</SectionLabel>
          <StyledInput
            label="Title"
            placeholder="What are you selling?"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />
          <StyledInput
            label="Description"
            placeholder="Describe your item — condition, usage, reason for selling..."
            value={description}
            onChangeText={setDescription}
            multiline
            lines={5}
            maxLength={500}
          />

        
          <SectionLabel>Category</SectionLabel>
          <View className="flex-row flex-wrap gap-2">
            {categories?.content.map((cat: any) => {
              const active = category === cat?.categoryId
              return ( !categoryLoading ?
                <Pressable
                  key={cat?.categoryId}
                  onPress={() => setCategory(cat?.categoryId)}
                  className={`flex-row items-center px-3.5 py-[9px] rounded-3xl border gap-1.5 ${
                    active ? 'bg-white white' : 'bg-[#1A1A1A] border-[#2A2A2A]'
                  }`}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={14}
                    color={active ? '#fff' : '#535353'}
                  />
                  <Text className={`font-bold text-[13px] ${active ? 'text-black' : 'text-[#B3B3B3]'}`}>
                    {cat?.categoryName}
                  </Text>
                </Pressable>: <>
                <View className='flex flex-row gap-2 mb-3 '>
                {   [...Array(4)].map(()=>(<CategoryCardLoader>
                    </CategoryCardLoader>)) } </View>
                </>
              )
            })}
          </View>
          <SectionLabel>Condition</SectionLabel>
          <View className="flex-row flex-wrap gap-2">
            {!productConditionsLoading ? productConditions?.map(cond => {
              const active = condition === cond.id
             
              return (
                <Pressable
                  key={cond.id}
                  onPress={() => setCondition(cond.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 24,
                    backgroundColor: active ? "#CEFA05"  : '#1A1A1A',
                    borderWidth: 1.5,
                    borderColor: active ? "#CEFA05" : '#2A2A2A',
                  }}
                >
                  <Text style={{ color: active ? "black" : '#B3B3B3', fontWeight: '700', fontSize: 13 }}>
                    {cond.name}
                  </Text>
                </Pressable>
              )
            }): <View className='flex flex-row gap-2 mb-3 '> {[...Array(4)].map(()=>(<CategoryCardLoader>
                    </CategoryCardLoader>))} </View>}
          </View>

        
          <SectionLabel>Pricing</SectionLabel>
          <StyledInput
            label="Price (₹)"
            placeholder="0"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            prefix="₹"
          />

          
          <View className="gap-2.5">
            {[
              { label: 'Open to negotiation', sub: 'Buyers can make offers', value: isNegotiable, set: setIsNegotiable, color: '#3B82F6',  },
              { label: 'Urgent sale', sub: 'Highlighted in listings', value: isUrgent, set: setIsUrgent, color: '#3B82F6',  },
            ].map(item => (
              <Pressable
                key={item.label}
                onPress={() => item.set(!item.value)}
                className="flex-row items-center bg-[#1A1A1A] rounded-2xl p-3.5 border"
                style={{ borderColor: '#2A2A2A' }}
              >
                <View className="flex-1">
                  <Text className="text-white font-bold text-[14px]">{item.label}</Text>
                  <Text className="text-[#535353] text-[12px] mt-0.5">{item.sub}</Text>
                </View>
                <View
                  className="w-[46px] h-[26px] rounded-[13px] justify-center px-[3px]"
                  style={{ backgroundColor: item.value ? item.color : '#242424' }}
                >
                  <View
                    className="w-5 h-5 rounded-full bg-white"
                    style={{ alignSelf: item.value ? 'flex-end' : 'flex-start' }}
                  />
                </View>
              </Pressable>
            ))}
          </View>

      
          <SectionLabel>Discount</SectionLabel>

          <Pressable
            onPress={() => { setHasDiscount(!hasDiscount); if (hasDiscount) setDiscountValue('') }}
            className="flex-row items-center bg-[#1A1A1A] rounded-2xl p-3.5 border"
            style={{ borderColor : '#2A2A2A', marginBottom: hasDiscount ? 12 : 0 }}
          >
            <View className="flex-1">
              <Text className="text-white font-bold text-[14px]">Add a discount</Text>
              <Text className="text-[#535353] text-[12px] mt-0.5">Attract more buyers with a special offer</Text>
            </View>
            <View
              className="w-[46px] h-[26px] rounded-[13px] justify-center px-[3px]"
              style={{ backgroundColor: hasDiscount ? '#14B8A6' : '#242424' }}
            >
              <View
                className="w-5 h-5 rounded-full bg-white"
                style={{ alignSelf: hasDiscount ? 'flex-end' : 'flex-start' }}
              />
            </View>
          </Pressable>

          {hasDiscount && (
            <View className="bg-[#1A1A1A] rounded-2xl p-3.5 border border-[#14B8A633] gap-3.5">

              <View>
                <Text className="text-[#B3B3B3] text-[12px] font-semibold mb-2">Discount Type</Text>
                <View className="flex-row gap-2">
                  {[
                    { id: 'percentage' as const, label: 'Percentage', icon: 'percent-outline' },
                    { id: 'flat' as const, label: 'Flat Amount', icon: 'currency-inr' },
                  ].map(opt => {
                    const active = discountType === opt.id
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => { setDiscountType(opt.id); setDiscountValue('') }}
                        className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-3xl border-2 ${
                          active ? 'bg-[#14B8A622] border-[#14B8A6]' : 'bg-[#242424] border-[#2A2A2A]'
                        }`}
                      >
                        <MaterialCommunityIcons
                          name={opt.icon as any}
                          size={14}
                          color={active ? '#14B8A6' : '#535353'}
                        />
                        <Text className={`font-bold text-[13px] ${active ? 'text-[#14B8A6]' : 'text-[#B3B3B3]'}`}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              </View>

              
              <View>
                <Text className="text-[#B3B3B3] text-[12px] font-semibold mb-2">
                  {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                </Text>
                <View className="flex-row items-center border-2 border-[#14B8A6] rounded-xl bg-[#242424] px-3.5">
                  <Text className="text-[#14B8A6] font-black text-[16px] mr-2">
                    {discountType === 'percentage' ? '%' : '₹'}
                  </Text>
                  <TextInput
                    value={discountValue}
                    onChangeText={text => {
                      if (discountType === 'percentage') {
                        const n = parseFloat(text)
                        if (!isNaN(n) && n > 100) return
                      }
                      setDiscountValue(text)
                    }}
                    placeholder={discountType === 'percentage' ? '0 – 100' : '0'}
                    placeholderTextColor="#535353"
                    keyboardType="numeric"
                    className="flex-1 text-white text-[16px] font-bold py-[13px]"
                  />
                </View>
              </View>

              {discountedPrice !== null && (
                <View className="bg-[#14B8A611] rounded-xl border border-[#14B8A633] p-3">
                
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-1.5">
                      <MaterialCommunityIcons name="tag-outline" size={14} color="#14B8A6" />
                      <Text className="text-[#14B8A6] text-[11px] font-bold tracking-widest uppercase">
                        Discount Applied
                      </Text>
                    </View>
                    <View className="bg-[#14B8A6] rounded-lg px-2 py-[3px]">
                      <Text className="text-black text-[11px] font-black">
                        {discountType === 'percentage' ? `${discountAmt}% OFF` : `₹${discountAmt} OFF`}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-end justify-between">
                    <View>
                      <Text className="text-[#535353] text-[13px] font-medium line-through">
                        ₹{originalPrice.toFixed(2)}
                      </Text>
                      <Text className="text-white text-[28px] font-black tracking-tight leading-none mt-0.5">
                        ₹{discountedPrice.toFixed(2)}
                      </Text>
                      <Text className="text-[#535353] text-[11px] font-medium mt-1">
                        Final price buyers will see
                      </Text>
                    </View>

            
                    <View className="bg-[#14B8A622] rounded-2xl px-3.5 py-2.5 items-center border border-[#14B8A633]">
                      <Text className="text-[#535353] text-[10px] font-semibold mb-0.5">You save</Text>
                      <Text className="text-[#14B8A6] text-[20px] font-black leading-none">
                        ₹{savings.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

        
          <SectionLabel>Tags</SectionLabel>
          <View className="flex-row flex-wrap gap-2 mb-2.5">
            {tags.map(t => (
              <Pressable
                key={t}
                onPress={() => removeTag(t)}
                className="flex-row items-center bg-[#8B5CF622] rounded-full px-3 py-1.5 gap-1.5 border border-[#8B5CF655]"
              >
                <Text className="text-[#8B5CF6] font-bold text-[12px]">#{t}</Text>
                <Ionicons name="close-circle" size={13} color="#8B5CF6" />
              </Pressable>
            ))}
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 border-2 border-[#2A2A2A] rounded-xl bg-[#1A1A1A]">
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                placeholder="Add a tag (e.g. iphone, calculus)"
                placeholderTextColor="#535353"
                returnKeyType="done"
                className="text-white text-[14px] px-3.5 py-[13px]"
              />
            </View>
            <Pressable
              onPress={addTag}
              className="w-[46px] h-[46px] rounded-xl bg-[#242424] items-center justify-center border border-[#2A2A2A]"
            >
              <Ionicons name="add" size={20} color="#B3B3B3" />
            </Pressable>
          </View>
          <Text className="text-[#535353] text-[11px] font-medium mt-1.5">
            Tags help buyers discover your item · Up to 6 tags
          </Text>

        
          <View className="mt-9 gap-2.5">
            <Pressable
              disabled={!(canPublish || btnLoader)}
              onPress={handlePublish}
              className={`py-4 rounded-full flex-row items-center justify-center gap-2 ${
                canPublish || btnLoader ? 'bg-[#1DB954]' : 'bg-[#242424]'
              }`}
            >
              <Ionicons name="storefront-outline" size={18} color={canPublish ? '#000' : '#535353'} />
              <Text className={`font-black text-[16px] tracking-tight ${canPublish ? 'text-black' : 'text-[#535353]'}`}>
                Publish Listing
              </Text>
            </Pressable>

            <Pressable  disabled={!(canPublish || btnLoader)} className="py-3.5 rounded-full items-center border border-[#2A2A2A]">
              <Text className="text-[#B3B3B3] font-bold text-[14px]">Save as Draft</Text>
            </Pressable>
          </View>

          {!canPublish && (
            <View className="mt-4 bg-[#1A1A1A] rounded-2xl p-3.5 flex-row items-center gap-2.5 border border-[#2A2A2A]">
              <Ionicons name="information-circle-outline" size={18} color="#535353" />
              <Text className="flex-1 text-[#535353] text-[12px] font-medium leading-[18px]">
                Complete all required fields to publish.{' '}
                {6 - completionScore} field{6 - completionScore !== 1 ? 's' : ''} remaining.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}