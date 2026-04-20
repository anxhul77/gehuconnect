import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"PLATFORM" | "ERP">("PLATFORM");

  const erpDetails = [
    { label: "Father Name", value: "RAJESH JAKHMOLA" },
    { label: "Mother Name", value: "SANGITA DEVI" },
    { label: "D.O.B.", value: "26/12/2005" },
    { label: "Official Email", value: "ANSHULJAKHMOLA.240111038@gehu.ac.in" },
    { label: "College", value: "GEHU-Dehradun Campus" },
    { label: "Course", value: "BACHELOR OF TECHNOLOGY" },
    { label: "Specialization", value: "N/A" },
    { label: "Year/Sem", value: "4" },
    { label: "Branch", value: "B.Tech (CSE)" },
    { label: "Section", value: "F2" },
    { label: "Class Roll No.", value: "13" },
    { label: "Enroll No.", value: "PV-24180297" },
    { label: "University Roll No.", value: "2418297" },
    { label: "HighSchool %", value: "69.40" },
    { label: "Intermediate %", value: "61.50" },
    { label: "Status", value: "Active", isStatus: true },
  ];

  return (
    <View style={styles.container}>
      {/* ── Top Bar ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={15} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={true} showsVerticalScrollIndicator={false}>
        {/* ── Hero Section ── */}
        <View style={styles.heroContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: "https://ui-avatars.com/api/?name=Anshul+Jakhmola&background=1F2933&color=fff&size=200" }}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.nameText}>ANSHUL JAKHMOLA</Text>
            <MaterialCommunityIcons name="check-decagram" size={20} color="#3B82F6" style={{ marginLeft: 6 }} />
          </View>
          <Text style={styles.idText}>240111038</Text>

          <View style={styles.contactContainer}>
            <View style={styles.contactChip}>
              <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
              <Text style={styles.contactText}>ANSHULJAKHMOLA333@GMAIL.COM</Text>
            </View>
            <View style={styles.contactChip}>
              <Ionicons name="call-outline" size={14} color="#9CA3AF" />
              <Text style={styles.contactText}>8077613420</Text>
            </View>
          </View>
        </View>

        {/* ── Badges Section ── */}
        <View style={styles.badgesContainer}>
          <View style={styles.badgeItem}>
            <View style={[styles.badgeIconBox, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
              <MaterialCommunityIcons name="check-decagram" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.badgeLabel}>Verified</Text>
          </View>
          
          <View style={styles.badgeItem}>
            <View style={[styles.badgeIconBox, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
              <Octicons name="code" size={20} color="#A855F7" />
            </View>
            <Text style={styles.badgeLabel}>Developer</Text>
          </View>

          <View style={styles.badgeItem}>
            <View style={[styles.badgeIconBox, { backgroundColor: "rgba(234, 179, 8, 0.15)" }]}>
              <Ionicons name="star" size={20} color="#EAB308" />
            </View>
            <Text style={styles.badgeLabel}>Contributor</Text>
          </View>
        </View>

        {/* ── Tabs Toggle ── */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tabBtn, activeTab === "PLATFORM" && styles.activeTabBtn]}
            onPress={() => setActiveTab("PLATFORM")}
          >
            <Text style={[styles.tabText, activeTab === "PLATFORM" && styles.activeTabText]}>
              CONNECT PROFILE
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, activeTab === "ERP" && styles.activeTabBtn]}
            onPress={() => setActiveTab("ERP")}
          >
            <Text style={[styles.tabText, activeTab === "ERP" && styles.activeTabText]}>
              ERP PROFILE
            </Text>
          </Pressable>
        </View>

        {/* ── Tab Content ── */}
        <View style={styles.tabContentContainer}>
          {activeTab === "PLATFORM" ? (
            <View style={styles.platformContent}>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>142</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>12.4k</Text>
                  <Text style={styles.statLabel}>Karma</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>89</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </View>
              </View>

              <View style={styles.bioCard}>
                <Text style={styles.bioTitle}>About</Text>
                <Text style={styles.bioText}>
                  Passionate React Native developer building GEU Connect. Always exploring new tech and pushing boundaries.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.erpContent}>
              <View style={styles.idCardHeader}>
                <Ionicons name="id-card-outline" size={22} color="#FF6B35" />
                <Text style={styles.idCardHeaderTitle}>Student ID Card</Text>
              </View>

              <View style={styles.erpList}>
                {erpDetails.map((item, index) => (
                  <View key={index} style={[styles.erpRow, index !== erpDetails.length - 1 && styles.erpRowBorder]}>
                    <Text style={styles.erpLabel}>{item.label}</Text>
                    {item.isStatus ? (
                      <View style={styles.statusChip}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{item.value}</Text>
                      </View>
                    ) : (
                      <Text style={styles.erpValue}>{item.value}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "black",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#1F2933",
    padding: 2,
    marginBottom: 16,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  nameText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  idText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 16,
  },
  contactContainer: {
    gap: 8,
    alignItems: "center",
  },
  contactChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  contactText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "500",
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  badgeItem: {
    alignItems: "center",
    gap: 6,
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 4,
    marginTop: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: "#1F2933",
  },
  tabText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: "white",
  },
  tabContentContainer: {
    padding: 16,
  },
  platformContent: {
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 20,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  bioCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 16,
  },
  bioTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  bioText: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 22,
  },
  erpContent: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  idCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "rgba(255,107,53,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  idCardHeaderTitle: {
    color: "#FF6B35",
    fontSize: 16,
    fontWeight: "600",
  },
  erpList: {
    paddingHorizontal: 16,
  },
  erpRow: {
    flexDirection: "row",
    paddingVertical: 14,
    justifyContent: "space-between",
    alignItems: "center",
  },
  erpRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  erpLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    flex: 1,
    paddingRight: 10,
  },
  erpValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1.5,
    textAlign: "right",
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  statusText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "600",
  },
});
