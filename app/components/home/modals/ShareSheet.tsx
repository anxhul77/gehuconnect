import { StyleSheet, Text, View, Share, Linking } from 'react-native'
import React from 'react'
import { Feather, } from '@expo/vector-icons'
import ShareItem from './ShareItem'
import * as Clipboard from 'expo-clipboard';

export default function ShareSheet() {
    const link = ""
    const sharePost = async () => {
        try {
            await Share.share({
                message: "Check this out! https://myapp.com/post/123",
            });
        } catch (error) {
            console.log(error);
        }
    };
    const shareWhatsapp = () => {
        Linking.openURL(
            `whatsapp://send?text=${encodeURIComponent(link)}`
        );
    };

    const shareInstagram = () => {
        Linking.openURL("instagram://");
    };

    const shareEmail = () => {
        Linking.openURL(
            `mailto:?subject=Check this out&body=${encodeURIComponent(link)}`
        );
    };

    const shareDiscord = async () => {
        await Share.share({
            message: link,
        });
    }
    const copyLink = async () => {
        await Clipboard.setStringAsync("https://myapp.com/post/123");
    };
    return (
        <View className="bg-[#212121] px-5 pb-6 pt-4">
            <Text className="text-white text-lg font-semibold mb-6">
                Share to
            </Text>

            <View className="flex-row  flex-wrap gap-12">
                <ShareItem
                    icon={<Feather name="link" size={28} color="white" />}
                    image={null}
                    title="Copy Link"
                    onPress={copyLink}
                />
                <ShareItem
                    image={null}
                    icon={<Feather name="more-horizontal" size={28} color="white" />}
                    title="More"
                    onPress={sharePost}
                />
                <ShareItem
                    icon={null}
                    image={require("../../../../assets/images/icons8-whatsapp-48.png")}
                    title="WhatsApp"
                    onPress={shareWhatsapp}
                />

                <ShareItem
                    icon={null}
                    image={require("../../../../assets/images/icons8-instagram-48.png")}
                    title="Instagram"
                    onPress={shareInstagram}
                />



                <ShareItem
                    icon={null}
                    image={require("../../../../assets/images/icons8-gmail-48.png")}
                    title="Email"
                    onPress={shareEmail}
                />
                <ShareItem
                    icon={null}
                    image={require("../../../../assets/images/icons8-discord-new-48.png")}
                    title="discord"
                    onPress={shareDiscord}
                />

            </View>
        </View>
    )
}

const styles = StyleSheet.create({})