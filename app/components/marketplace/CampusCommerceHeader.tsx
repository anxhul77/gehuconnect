import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";



export default function CampusCommerceHeader({ headerHeight}:any) {
  const router=useRouter()
    const insets=useSafeAreaInsets();
      const [activeTab, setActiveTab] = useState<"Marketplace" | "Housing">(
        "Marketplace",
      );
      const [marketplaceFilter, setMarketplaceFilter] = useState("all");
      const [housingFilter, setHousingFilter] = useState("all");
      const [searchQuery, setSearchQuery] = useState("");
      const handleBackArrow=()=>{
        router.back()
      }
  return (
    <View className='' style={{paddingTop:insets.top+10,height:headerHeight} }>
   <View className="flex-row  items-center mb-6 ">
    
      <Pressable onPress={handleBackArrow}  className="mb-4 mr-4 ">
        <Ionicons name="arrow-back" color="gray" size={22} />
      </Pressable>
          <View className='flex-1 '>
            <Text className="text-white text-2xl font-black uppercase tracking-tighter">
              Campus Commerce
            </Text>
            <Text className="text-zinc-500 text-xs font-bold">
              Graphic Era University • P2P
            </Text>
          </View>
        </View>

        
        <View className="flex-row bg-zinc-900/50 p-1.5 rounded-2xl mb-4 mx-4">
          {(["Marketplace", "Housing"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => {
                setActiveTab(tab);
                setSearchQuery(""); 
              }}
              className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${activeTab === tab ? (tab === "Marketplace" ? "bg-[#FF4D4D]" : "bg-[#5856D6]") : ""}`}
            >
              <MaterialCommunityIcons
                name={tab === "Marketplace" ? "cart" : "home-modern"}
                size={18}
                color={activeTab === tab ? "white" : "#71717a"}
              />
              <Text
                className={`font-black ml-2 ${activeTab === tab ? "text-white" : "text-zinc-500"}`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
        </View>
  )
} 
             