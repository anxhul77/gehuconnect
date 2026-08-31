import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { FontAwesome } from "@expo/vector-icons";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import ContainerwithSwitch from "../../Custom/ContainerwithSwitch";
import RadioSwitch from "../../Custom/RadioSwitch";
import useDebounce from "@/src/hooks/useDebouncingHook";


const auditLogActions = [
    // Community
    { id: "COMMUNITY_NAME_CHANGED", name: "Community Name Changed" },
    { id: "COMMUNITY_DESCRIPTION_CHANGED", name: "Community Description Changed" },
    { id: "COMMUNITY_ICON_CHANGED", name: "Community Icon Changed" },
    { id: "COMMUNITY_BANNER_CHANGED", name: "Community Banner Changed" },
    { id: "COMMUNITY_SETTINGS_CHANGED", name: "Community Settings Changed" },
    { id: "COMMUNITY_VISIBILITY_CHANGED", name: "Community Visibility Changed" },
    { id: "COMMUNITY_VERIFICATION_CHANGED", name: "Community Verification Changed" },

    // Members
    { id: "MEMBER_JOINED", name: "Member Joined" },
    { id: "MEMBER_LEFT", name: "Member Left" },
    { id: "MEMBER_KICKED", name: "Member Kicked" },
    { id: "MEMBER_BANNED", name: "Member Banned" },
    { id: "MEMBER_UNBANNED", name: "Member Unbanned" },
    { id: "MEMBER_TIMEOUT", name: "Member Timed Out" },
    { id: "MEMBER_TIMEOUT_REMOVED", name: "Member Timeout Removed" },
    { id: "MEMBER_NICKNAME_CHANGED", name: "Member Nickname Changed" },
    { id: "MEMBER_AVATAR_CHANGED", name: "Member Avatar Changed" },
    { id: "MEMBER_PRONOUNS_CHANGED", name: "Member Pronouns Changed" },

    // Roles
    { id: "ROLE_CREATED", name: "Role Created" },
    { id: "ROLE_UPDATED", name: "Role Updated" },
    { id: "ROLE_DELETED", name: "Role Deleted" },
    { id: "ROLE_NAME_CHANGED", name: "Role Name Changed" },
    { id: "ROLE_COLOR_CHANGED", name: "Role Color Changed" },
    { id: "ROLE_PERMISSIONS_CHANGED", name: "Role Permissions Changed" },
    { id: "ROLE_ASSIGNED", name: "Role Assigned" },
    { id: "ROLE_REMOVED", name: "Role Removed" },
    { id: "ROLE_POSITION_CHANGED", name: "Role Position Changed" },

    // Channels
    { id: "CHANNEL_CREATED", name: "Channel Created" },
    { id: "CHANNEL_UPDATED", name: "Channel Updated" },
    { id: "CHANNEL_DELETED", name: "Channel Deleted" },
    { id: "CHANNEL_NAME_CHANGED", name: "Channel Name Changed" },
    { id: "CHANNEL_TOPIC_CHANGED", name: "Channel Topic Changed" },
    { id: "CHANNEL_TYPE_CHANGED", name: "Channel Type Changed" },
    { id: "CHANNEL_SLOWMODE_CHANGED", name: "Channel Slowmode Changed" },
    { id: "CHANNEL_PERMISSION_CHANGED", name: "Channel Permissions Changed" },
    { id: "CHANNEL_POSITION_CHANGED", name: "Channel Position Changed" },
    { id: "CHANNEL_CATEGORY_CHANGED", name: "Channel Category Changed" },

    // Messages
    { id: "MESSAGE_DELETED", name: "Message Deleted" },
    { id: "MESSAGE_EDITED", name: "Message Edited" },
    { id: "MESSAGE_PINNED", name: "Message Pinned" },
    { id: "MESSAGE_UNPINNED", name: "Message Unpinned" },
    { id: "MESSAGE_BULK_DELETED", name: "Messages Bulk Deleted" },

    // Permissions
    { id: "PERMISSION_CHANGED", name: "Permission Changed" },
    { id: "ROLE_PERMISSION_CHANGED", name: "Role Permission Changed" },
    { id: "MEMBER_PERMISSION_CHANGED", name: "Member Permission Changed" },

    // Invites
    { id: "INVITE_CREATED", name: "Invite Created" },
    { id: "INVITE_DELETED", name: "Invite Deleted" },
    { id: "INVITE_UPDATED", name: "Invite Updated" },
    { id: "INVITE_REVOKED", name: "Invite Revoked" },

    // Moderation
    { id: "MEMBER_WARNED", name: "Member Warned" },
    { id: "MEMBER_UNWARNED", name: "Member Warning Removed" },
    { id: "MODERATION_ACTION", name: "Moderation Action" },

    // Reports
    { id: "REPORT_CREATED", name: "Report Created" },
    { id: "REPORT_RESOLVED", name: "Report Resolved" },
    { id: "REPORT_DISMISSED", name: "Report Dismissed" },

    // Webhooks / integrations
    { id: "WEBHOOK_CREATED", name: "Webhook Created" },
    { id: "WEBHOOK_UPDATED", name: "Webhook Updated" },
    { id: "WEBHOOK_DELETED", name: "Webhook Deleted" },

    // Bots / integrations
    { id: "BOT_ADDED", name: "Bot Added" },
    { id: "BOT_REMOVED", name: "Bot Removed" },
    { id: "INTEGRATION_ADDED", name: "Integration Added" },
    { id: "INTEGRATION_REMOVED", name: "Integration Removed" },

    // Community features
    { id: "EMOJI_CREATED", name: "Emoji Created" },
    { id: "EMOJI_UPDATED", name: "Emoji Updated" },
    { id: "EMOJI_DELETED", name: "Emoji Deleted" },
    { id: "STICKER_CREATED", name: "Sticker Created" },
    { id: "STICKER_UPDATED", name: "Sticker Updated" },
    { id: "STICKER_DELETED", name: "Sticker Deleted" },

    // Server/community structure
    { id: "CATEGORY_CREATED", name: "Category Created" },
    { id: "CATEGORY_UPDATED", name: "Category Updated" },
    { id: "CATEGORY_DELETED", name: "Category Deleted" },
    { id: "CATEGORY_POSITION_CHANGED", name: "Category Position Changed" },

    // Voice
    { id: "MEMBER_MOVED", name: "Member Moved" },
    { id: "MEMBER_DISCONNECTED", name: "Member Disconnected" },
    { id: "MEMBER_MUTED", name: "Member Muted" },
    { id: "MEMBER_UNMUTED", name: "Member Unmuted" },
    { id: "MEMBER_DEAFENED", name: "Member Deafened" },
    { id: "MEMBER_UNDEAFENED", name: "Member Undeafened" },
];

type AuditLogBottomSheetProps = {
    open: boolean;
    selectedAction?: string;
    onSelectAction?: (actionId: string) => void;
    onClose?: () => void;

    snapPoints?: string[];
    initialSnapIndex?: number;

    title?: string;
    description?: string;
    searchPlaceholder?: string;

    backgroundColor?: string;
};

export function AuditLogBottomSheet({
    open,
    selectedAction,
    onSelectAction,
    onClose,

    snapPoints = ["90%"],
    initialSnapIndex = 0,

    title = "Filter by Action",
    description = "Select an action type to filter audit logs",
    searchPlaceholder = "Search actions...",

    backgroundColor = "#000000",
}: AuditLogBottomSheetProps) {
    const sheetRef = useRef<BottomSheet>(null);

    const [search, setSearch] = useState("");

    // Your custom debounced search hook
    const debouncedSearch = useDebounce(search, 300);

    const filteredActions = useMemo(() => {
        const query = debouncedSearch.toLowerCase().trim();

        if (!query) {
            return auditLogActions;
        }

        return auditLogActions.filter(
            (action) =>
                action.name.toLowerCase().includes(query) ||
                action.id.toLowerCase().includes(query)
        );
    }, [debouncedSearch]);

    useEffect(() => {
        if (open) {
            sheetRef.current?.snapToIndex(initialSnapIndex);
        } else {
            sheetRef.current?.close();
        }
    }, [open, initialSnapIndex]);

    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );

    const renderItem = useCallback(
        ({
            item,
            index,
        }: {
            item: { id: string; name: string };
            index: number;
        }) => {
            const isSelected = selectedAction === item.id;
            const isFirst = index === 0;
            const isLast = index === filteredActions.length - 1;

            return (
                <Pressable
                    onPress={() => onSelectAction?.(item.id)}
                    style={styles.itemWrapper}
                >
                    <ContainerwithSwitch
                        title={item.name}
                        backgroundColor="#121212"
                        style={{
                            borderTopLeftRadius: isFirst ? 16 : 0,
                            borderTopRightRadius: isFirst ? 16 : 0,
                            borderBottomLeftRadius: isLast ? 16 : 0,
                            borderBottomRightRadius: isLast ? 16 : 0,

                            borderBottomWidth: isLast ? 0 : 1.5,
                            borderBottomColor: "#1a1d20",
                        }}
                        customSwitch={
                            <RadioSwitch selected={isSelected} />
                        }
                    />
                </Pressable>
            );
        },
        [
            selectedAction,
            onSelectAction,
            filteredActions.length,
        ]
    );


    return (
        <BottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            onClose={handleClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor,
            }}
            style={styles.sheet}
        >
            <View style={styles.container}>

                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {title}
                        </Text>

                        <Text style={styles.description}>
                            {description}
                        </Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <FontAwesome
                            name="search"
                            size={20}
                            color="rgba(255,255,255,0.22)"
                        />

                        <TextInput
                            style={styles.searchInput}
                            placeholder={searchPlaceholder}
                            placeholderTextColor="rgba(255,255,255,0.22)"
                            value={search}
                            onChangeText={setSearch}
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="search"
                        />
                    </View>

                    <Text style={styles.sectionTitle}>
                        Actions
                    </Text>
                </View>

                <BottomSheetFlatList
                    style={{ flex: 1 }}
                    data={filteredActions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                />
            </View>
        </BottomSheet>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    sheet: {
        overflow: "hidden",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },

    titleContainer: {
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },

    description: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 14,
        marginTop: 4,
        marginBottom: 12,
    },

    searchContainer: {
        minHeight: 46,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#121212",
        borderRadius: 16,
        paddingHorizontal: 16,
        gap: 8,
    },

    searchInput: {
        flex: 1,
        color: "#f0f0f0",
        fontSize: 15,
    },

    sectionTitle: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 14,
        fontWeight: "500",
        marginTop: 24,
        marginBottom: 4,
    },

    contentContainer: {
        paddingBottom: 24,
    },

    itemWrapper: {
        paddingHorizontal: 16,
    },
});