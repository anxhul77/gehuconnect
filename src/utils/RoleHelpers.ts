import { isEnabled } from "react-native/Libraries/Performance/Systrace";

export const PERMISSION_GROUPS = [
    {
        name: "Community",
        description: "All the permissions regarding community",
        permissions: [
            {
                key: "MANAGE_COMMUNITY",
                bit: (1n << 0n).toString(),
                title: "Manage Community",
                description: "Allows members to update community settings, such as name and description.",
                isEnabled: false
            },
            {
                key: "MANAGE_ROLES",
                bit: (1n << 11n).toString(),
                title: "Manage Roles",
                description: "Allows members to create, edit, or delete roles.",
                isEnabled: false,
            },
            {
                key: "MANAGE_CHANNELS",
                bit: (1n << 21n).toString(),
                title: "Manage Channels",
                description: "Allows members to create, edit, or delete channels.",
                isEnabled: false,
            },
            {
                key: "VIEW_AUDIT_LOG",
                bit: (1n << 10n).toString(),
                title: "View Audit Log",
                description: "Allows members to view a record of who made which changes in the community.",
                isEnabled: false,
            },
        ],
    },

    {
        name: "Feed",
        description: "All the permissions regarding feed",
        permissions: [
            {
                key: "CREATE_POST",
                bit: (1n << 43n).toString(),
                title: "Create Post",
                description: "Allows members to create new posts in the feed.",
                isEnabled: false,
            },
            {
                key: "DELETE_ANY_POST",
                bit: (1n << 46n).toString(),
                title: "Delete Any Post",
                description: "Allows members to delete posts made by other members.",
                isEnabled: false,
            },
            {
                key: "LOCK_POST",
                bit: (1n << 48n).toString(),
                title: "Lock Post",
                description: "Allows members to lock posts, preventing new comments.",
                isEnabled: false,
            },
            {
                key: "FEATURE_POST",
                bit: (1n << 49n).toString(),
                title: "Feature Post",
                description: "Allows members to feature posts to increase their visibility.",
                isEnabled: false,
            },
            {
                key: "PIN_POST",
                bit: (1n << 47n).toString(),
                title: "Pin Post",
                description: "Allows members to pin posts to the top of the feed.",
                isEnabled: false,
            },
        ],
    },

    {
        name: "Messages",
        description: "All the permissions regarding messages",
        permissions: [
            {
                key: "SEND_MESSAGES",
                bit: (1n << 24n).toString(),
                title: "Send Messages",
                description: "Allows members to send messages in text channels.",
                isEnabled: false
            },
            {
                key: "DELETE_MESSAGES",
                bit: (1n << 29n).toString(),
                title: "Delete Messages",
                description: "Allows members to delete messages sent by others.",
                isEnabled: false
            },
            {
                key: "UPLOAD_FILES",
                bit: (1n << 33n).toString(),
                title: "Attach Files",
                description: "Allows members to upload files and media in channels.",
                isEnabled: false
            },
        ],
    },

    {
        name: "Events",
        description: "All the permissions regarding events",
        permissions: [
            {
                key: "CREATE_EVENT",
                bit: (1n << 52n).toString(),
                title: "Create Events",
                description: "Allows members to create new community events.",
                isEnabled: false
            },
            {
                key: "EDIT_EVENT",
                bit: (1n << 53n).toString(),
                title: "Manage Events",
                description: "Allows members to edit or cancel community events.",
                isEnabled: false
            },
        ],
    },

    {
        name: "Moderation",
        description: "All the permissions regarding moderation",
        permissions: [
            {
                key: "KICK_MEMBERS",
                bit: (1n << 7n).toString(),
                title: "Kick Members",
                description: "Allows members to remove other members from the community.",
                isEnabled: false
            },
            {
                key: "BAN_MEMBERS",
                bit: (1n << 8n).toString(),
                title: "Ban Members",
                description: "Allows members to permanently ban other members from the community.",
                isEnabled: false
            },
            {
                key: "TIMEOUT_MEMBERS",
                bit: (1n << 9n).toString(),
                title: "Timeout Members",
                description: "Allows members to temporarily restrict other members from interacting.",
                isEnabled: false
            },
        ],
    },
];
export const hasPermission = (
    mask: string,
    bit: string

) => {

    const maskBigInt = BigInt(mask)
    const bitBigInt = BigInt(bit)
    return (maskBigInt & bitBigInt) === bitBigInt
};
export const ChannelPermissionSettings = [
    {
        group: "General",
        permissions: [
            {
                key: "MANAGE_CHANNELS",
                bit: (1n << 21n).toString(),
                title: "Manage Channel",
                description:
                    "Allow members to change this channel's name, description and other settings.",
                state: "INHERIT",
            },
            {
                key: "VIEW_CHANNEL",
                bit: (1n << 17n).toString(),
                title: "View Channel",
                description:
                    "Allow members to view this channel. Denying this makes the channel invisible to them.",
                state: "INHERIT",
            },
            {
                key: "MANAGE_ROLES",
                bit: (1n << 11n).toString(),
                title: "Manage Permissions",
                description:
                    "Allow members to edit permission overrides for this channel.",
                state: "INHERIT",
            },
        ],
    },

    {
        group: "Text",
        permissions: [
            {
                key: "SEND_MESSAGES",
                bit: (1n << 24n).toString(),
                title: "Send Messages",
                description: "Allow members to send messages in this channel.",
                state: "INHERIT",
            },
            {
                key: "DELETE_MESSAGES",
                bit: (1n << 29n).toString(),
                title: "Manage Messages",
                description:
                    "Allow members to delete or manage messages from other members.",
                state: "INHERIT",
            },
            {
                key: "PIN_MESSAGES",
                bit: (1n << 30n).toString(),
                title: "Pin Messages",
                description: "Allow members to pin messages.",
                state: "INHERIT",
            },
            {
                key: "MENTION_EVERYONE",
                bit: (1n << 34n).toString(),
                title: "Mention @everyone",
                description: "Allow members to mention @everyone and all roles.",
                state: "INHERIT",
            },
            {
                key: "UPLOAD_FILES",
                bit: (1n << 33n).toString(),
                title: "Attach Files",
                description: "Allow members to upload files.",
                state: "INHERIT",
            },
            {
                key: "UPLOAD_IMAGE",
                bit: (1n << 25n).toString(),
                title: "Send Images",
                description: "Allow members to upload images.",
                state: "INHERIT",
            },
            {
                key: "UPLOAD_VIDEO",
                bit: (1n << 26n).toString(),
                title: "Send Videos",
                description: "Allow members to upload videos.",
                state: "INHERIT",
            },
            {
                key: "UPLOAD_AUDIO",
                bit: (1n << 27n).toString(),
                title: "Send Voice Messages",
                description: "Allow members to upload voice messages.",
                state: "INHERIT",
            },
        ],
    },

    {
        group: "Events",
        permissions: [
            {
                key: "CREATE_EVENT",
                bit: (1n << 52n).toString(),
                title: "Create Events",
                description: "Allow members to create events in this channel.",
                state: "INHERIT",
            },
            {
                key: "EDIT_EVENT",
                bit: (1n << 53n).toString(),
                title: "Manage Events",
                description: "Allow members to edit events in this channel.",
                state: "INHERIT",
            },
        ],
    },

    {
        group: "Voice",
        permissions: [
            {
                key: "CONNECT",
                bit: (1n << 35n).toString(),
                title: "Connect",
                description: "Allow members to connect to this voice channel.",
                state: "INHERIT",
            },
            {
                key: "SPEAK",
                bit: (1n << 36n).toString(),
                title: "Speak",
                description: "Allow members to speak in this voice channel.",
                state: "INHERIT",
            },
            {
                key: "VIDEO",
                bit: (1n << 37n).toString(),
                title: "Video",
                description: "Allow members to share video.",
                state: "INHERIT",
            },
            {
                key: "STREAM",
                bit: (1n << 38n).toString(),
                title: "Stream",
                description: "Allow members to stream their screen.",
                state: "INHERIT",
            },
            {
                key: "MUTE_MEMBERS",
                bit: (1n << 39n).toString(),
                title: "Mute Members",
                description: "Allow members to mute others.",
                state: "INHERIT",
            },
            {
                key: "MOVE_MEMBERS",
                bit: (1n << 41n).toString(),
                title: "Move Members",
                description: "Allow members to move others between voice channels.",
                state: "INHERIT",
            },
        ],
    },
];
export function transformPermissionSettings(
    response: { allowedPermissions: string; deniedPermissions: string }
) {
    const allowed = BigInt(response.allowedPermissions);
    const denied = BigInt(response.deniedPermissions);

    return ChannelPermissionSettings.map((group) => ({
        ...group,
        permissions: group.permissions.map((permission) => {
            let state: "ALLOW" | "DENY" | "INHERIT";

            if ((allowed & BigInt(permission.bit)) !== BigInt(0)) {
                state = "ALLOW";
            } else if ((denied & BigInt(permission.bit)) !== BigInt(0)) {
                state = "DENY";
            } else {
                state = "INHERIT";
            }

            return {
                ...permission,
                state,
            };
        }),
    }));
}
export const feedSettings = [
    {
        group: "General Preference",
        permissions: [
            {
                title: "Allow Posts",
                key: "ALLOW_POSTS",
                bit: (1n << 43n).toString(),
                description: "Members can create posts in the feed",
                isEnabled: false,
            },
            {
                title: "Require Approval",
                key: "REQUIRE_APPROVAL",
                bit: (1n << 51n).toString(),
                description: "Posts must be approved by a moderator",
                isEnabled: false,
            }, {
                title: "NSFW Content",
                key: "ALLOW_NSFW",
                bit: (1n << 44n).toString(),
                description: "Allow posts with 18+ content Note:(NFSW content is currently disabled)",
                isEnabled: false,
            }

        ]
    },
    {
        group: "Post Content",
        permissions: [
            {
                title: "Allow Images",
                key: "ALLOW_IMAGES",
                bit: (1n << 26n).toString(),
                description: "Allow members to post images",
                isEnabled: false,
            },
            {
                title: "Allow Videos",
                key: "ALLOW_VIDEOS",
                bit: (1n << 26n).toString(),
                description: "Allow members to post videos",
                isEnabled: false,
            },
            {
                title: "Allow Pin",
                key: "ALLOW_PIN",
                bit: (1n << 47n).toString(),
                description: "Allow members to pin others in posts",
                isEnabled: false,
            }
        ]
    },
    {
        group: "Featured Posts",
        permissions: [
            {
                title: "Manage Featured",
                key: "MANAGE_FEATURED",
                description: "Pin posts to the top of the feed",
                bit: (1n << 49n).toString(),
                isEnabled: false,
            }
        ]
    },

]
export const buildPermissionBit = (isEnable: boolean, bit: string, current: string) => {
    let newMask = null;

    if (isEnable) {
        newMask = (BigInt(current) & ~BigInt(bit)).toString();
    } else {
        newMask = (BigInt(current) | BigInt(bit)).toString();
    }

    return newMask
}
export const eventSettings = [
    {
        group: "Event Settings",
        permissions: [
            {
                title: "Allow Events",
                key: "ALLOW_EVENTS",
                bit: (1n << 52n).toString(),
                description: "Members can create events in the feed",
                isEnabled: false,
            },
            {
                title: "Require Approval",
                key: "REQUIRE_APPROVAL",
                bit: (1n << 59n).toString(),
                description: "Events must be approved by a moderator",
                isEnabled: false,
            },
            {
                title: "Allow Public Events",
                key: "ALLOW_PUBLIC_EVENT",
                bit: (1n << 60n).toString(),
                description: "Events can be shared outside the community",
                isEnabled: false,
            },
            {
                title: "Pin Events",
                key: "PIN_EVENTS",
                bit: (1n << 55n).toString(),
                description: "Events can be pinned to the top of the page",
                isEnabled: false,
            }
        ]
    },


]
export const moderationSettings = [
    {
        group: "Automated Filters",
        permissions: [
            {
                key: "spam_filter",
                title: "Spam filter",
                description: "Autotmatically block common spam messages ",
                bit: (1n << 61n).toString(),
                isEnabled: false,
            },
            {
                key: "raid_protectiton",
                title: "Raid Protection",
                description: "Require manual approval if many users join at once",
                bit: (1n << 62n).toString(),
                isEnabled: false
            }
        ]
    }
]