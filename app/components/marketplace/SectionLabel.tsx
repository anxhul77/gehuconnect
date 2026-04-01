import { Text } from "react-native";

export default function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ color: "#B3B3B3", fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 28 }}>
      {children}
    </Text>
  )
}