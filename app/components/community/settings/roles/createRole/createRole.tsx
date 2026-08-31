import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, View, ScrollView, TextInput, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = 16;

const ROLE_TEMPLATES = [
    {
        id: 'member',
        name: 'Member',
        description: 'Trusted community member.',
        permissions: [
            'View channels', 'Send messages', 'Upload images/videos/audio/files', 'Edit own messages', 'Use reactions', 'Create posts', 'Edit own posts', 'Delete own posts', 'Comment', 'Connect, Speak, Video, Stream', 'Change nickname'
        ],
        color: '#10B981'
    },
    {
        id: 'moderator',
        name: 'Moderator',
        description: 'Keeps the community safe and organized.',
        permissions: [
            'Kick members', 'Ban members', 'Timeout members', 'View audit log', 'Delete messages', 'Pin messages', 'Manage threads', 'Mute/Deafen/Move members', 'Delete any post', 'Remove posts', 'Lock posts', 'Pin posts', 'Approve posts', 'Delete comments', 'Lock comments', 'Warn members', 'Clear messages'
        ],
        color: '#5865F2'
    },
    {
        id: 'admin',
        name: 'Administrator',
        description: 'Full access to manage the community.',
        permissions: [
            'Community management', 'Member management (kick, ban, timeout)', 'Role management', 'Channel management', 'Message management', 'Voice management', 'Feed moderation', 'Event management', 'Community appearance', 'Invite management', 'Audit log', 'Warn members', 'Clear messages', 'Bypass slowmode'
        ],
        color: '#ED4956'
    }
];

export default function CreateRole() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [roleName, setRoleName] = useState('');
    const [roleColor, setRoleColor] = useState('#99aab5');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const scrollX = useRef(new Animated.Value(0)).current;

    const maxScroll = Math.max(
        (CARD_WIDTH + CARD_SPACING) * ROLE_TEMPLATES.length - CARD_SPACING + 32 - SCREEN_WIDTH,
        1
    );

    const widthPerc = scrollX.interpolate({
        inputRange: [0, maxScroll / 2, maxScroll],
        outputRange: ['33.33%', '66.66%', '100%'],
        extrapolate: 'clamp'
    });

    const bgColor = scrollX.interpolate({
        inputRange: [0, maxScroll / 2, maxScroll],
        outputRange: ['#10B981', '#5865F2', '#ED4956'],
        extrapolate: 'clamp'
    });

    const handleNext = () => {
        if (step === 1 && roleName.trim().length > 0) {
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            router.back();
        }
    };

    const handleCreate = () => {
        // Submit logic would go here
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={handleBack} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text className="text-white font-bold text-xl flex-1 text-center">
                    {step === 1 ? 'Create Role' : 'Permissions'}
                </Text>
                {step === 1 ? (
                    <Pressable
                        className="p-2"
                        onPress={handleNext}
                        disabled={!roleName.trim()}
                    >
                        <Text className={`font-bold text-base ${roleName.trim() ? 'text-[#5865F2]' : 'text-white/30'}`}>Next</Text>
                    </Pressable>
                ) : (
                    <Pressable
                        className="p-2"
                        onPress={handleCreate}
                        disabled={!selectedTemplate}
                    >
                        <Text className={`font-bold text-base ${selectedTemplate ? 'text-[#5865F2]' : 'text-white/30'}`}>Create</Text>
                    </Pressable>
                )}
            </View>

            {step === 1 ? (
                <View className="gap-6 px-4 pt-4">
                    <View>
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Role Name</Text>
                        </View>
                        <TextInput
                            className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12 text-white"
                            placeholder="Enter Role Name"
                            placeholderTextColor="#99aab5"
                            value={roleName}
                            onChangeText={setRoleName}
                            autoFocus
                        />
                    </View>
                    <View>
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Role Color</Text>
                        </View>
                        <Pressable className="flex-row items-center p-4 h-14 bg-white/[0.05] rounded-xl border border-white/12">
                            <View className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: roleColor }} />
                            <Text className="text-white text-base font-medium">{roleColor}</Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <View className="flex-1 pt-4 pb-8">
                    <View className="px-4 mb-6">
                        <Text className="text-white font-bold text-lg mb-2">Choose a template</Text>
                        <Text className="text-white/55 text-sm mb-5">Start with a baseline set of permissions. You can customize them later.</Text>

                        {/* Progress Bar Track with Levels */}
                        <View className="mb-2 mt-2">
                            <View className="flex-row justify-between mb-2 px-2">
                                <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Level 1</Text>
                                <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Level 2</Text>
                                <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Level 3</Text>
                            </View>
                            <View className="h-2.5 bg-white/10 rounded-full w-full overflow-hidden relative">
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: widthPerc,
                                        backgroundColor: bgColor,
                                        borderRadius: 999
                                    }}
                                />
                                {/* Segment Dividers */}
                                <View className="absolute inset-0 flex-row">
                                    <View className="flex-1 border-r-2 border-black/40" />
                                    <View className="flex-1 border-r-2 border-black/40" />
                                    <View className="flex-1" />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="flex-1">
                        <Animated.ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                            snapToInterval={CARD_WIDTH + CARD_SPACING}
                            decelerationRate="fast"
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                { useNativeDriver: false } // Required for width and background color animation
                            )}
                            scrollEventThrottle={16}
                        >
                            {ROLE_TEMPLATES.map((template, index) => {
                                const isSelected = selectedTemplate === template.id;
                                const isLast = index === ROLE_TEMPLATES.length - 1;
                                return (
                                    <View
                                        key={template.id}
                                        style={{ width: CARD_WIDTH, marginRight: isLast ? 0 : CARD_SPACING, height: 500 }}
                                        className={`p-5 rounded-3xl border bg-[#121212] overflow-hidden ${isSelected ? 'border-[#5865F2] ' : ' '}`}
                                    >

                                        <Pressable
                                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                            onPress={() => setSelectedTemplate(template.id)}
                                        />

                                        <View pointerEvents="none" className={`absolute top-4 right-4 w-6 h-6 rounded-full border items-center justify-center z-10 ${isSelected ? 'border-[#5865F2] bg-[#5865F2]' : 'border-white/30'}`}>
                                            {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                                        </View>

                                        <View pointerEvents="none" className="items-center mb-4 mt-2">
                                            <Text className="font-bold text-2xl mb-1 text-center" style={{ color: "white" }}>{template.name}</Text>
                                            <Text className="text-white/55 text-sm text-center">{template.description}</Text>
                                        </View>

                                        <View className="flex-1 mt-2 border-t border-white/5 pt-4">
                                            <Text pointerEvents="none" className="font-bold text-white/55 mb-3 text-[10px] uppercase tracking-widest">Permissions</Text>
                                            <View className="flex-1">
                                                <FlashList
                                                    data={template.permissions}
                                                    estimatedItemSize={28}
                                                    indicatorStyle="white"

                                                    contentContainerStyle={{ paddingBottom: 16 }}
                                                    showsVerticalScrollIndicator={true}
                                                    nestedScrollEnabled={true}
                                                    renderItem={({ item: p }) => (
                                                        <Pressable
                                                            onPress={() => setSelectedTemplate(template.id)}
                                                            className="flex-row items-start pr-2 mb-3"
                                                        >
                                                            <Ionicons name="checkmark" size={16} color={template.color} style={{ marginRight: 8, marginTop: 1 }} />
                                                            <Text className="text-white/80 text-[13px] leading-5 flex-1">{p}</Text>
                                                        </Pressable>
                                                    )}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )
                            })}
                        </Animated.ScrollView>
                    </View>
                </View>
            )
            }
        </SafeAreaView >
    )
}