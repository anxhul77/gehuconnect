import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import Feedpostcard from "../components/feedpostcard";

export default function Index() {
  return (
    <ScrollView>
    <View style={{ backgroundColor: 'yellow', minHeight: 300 }}>
      <Text className="text-xl font-bold ">welcome</Text>
      <Feedpostcard/>
    </View>
    </ScrollView>
  );
}
