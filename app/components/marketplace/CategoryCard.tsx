import { Text, Pressable } from 'react-native'


interface CategoryItem {
  item: {
    categoryId: string | null
    categoryName: string
  }
  selectedCategory: string | null
  setSelectedCategory: (id: string | null) => void
}
export default function CategoryCard({ item, selectedCategory, setSelectedCategory }: CategoryItem) {
  const selected =
    item.categoryName === "All"
      ? selectedCategory === null
      : selectedCategory === item.categoryId;
  function handleOnPress() {
    if (item.categoryName === "All") {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(item.categoryId);
    }

  }
  return (
    <Pressable
      key={item?.categoryId}
      onPress={handleOnPress}

      className={` items-center justify-center rounded-full border px-4 h-10 ${selected
        ? "bg-[#FFFFFF] border-[#FFFFFF]"
        : "bg-[#1A1A1A]  border-[#2A2A2A]"
        }`}
    >
      <Text style={{ fontWeight: 800 }}
        className={`text-md  ${selected ? "text-[#0A0A0A]" : "text-[#B3B3B3]"
          }`}
      >
        {item?.categoryName}
      </Text>
    </Pressable>
  )
}
