import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props{
    headerHeight:number
}

export default function CampusCommerceHeader({headerHeight}:Props){

    return(
        <View style={[styles.container,{height:headerHeight}]}>
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.greeting}>
                        Welcome back 👋
                    </Text>
                    <Text style={styles.title}>
                        Campus Commerce
                    </Text>
                </View>

                <View style={styles.rightSection}>

                    <Pressable style={styles.iconButton}>

                        <Ionicons
                            name="notifications-outline"
                            size={22}
                            color="white"
                        />

                    </Pressable>

                    <Image
                        source={{
                            uri:"https://i.pravatar.cc/150"
                        }}
                        style={styles.avatar}
                    />

                </View>

            </View>

            

            <Text style={styles.subtitle}>
                Buy and sell within your campus
            </Text>

        </View>

    );

}

const styles = StyleSheet.create({

    container:{
        justifyContent:"flex-end",
        paddingBottom:20
    },

    topRow:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
    },

    greeting:{
        color:"#a1a1aa",
        fontSize:13
    },

    title:{
        color:"white",
        fontSize:24,
        fontWeight:"bold",
        marginTop:2
    },

    subtitle:{
        color:"#71717a",
        marginTop:6,
        fontSize:13
    },

    rightSection:{
        flexDirection:"row",
        alignItems:"center",
        gap:12
    },

    iconButton:{
        backgroundColor:"#18181b",
        padding:10,
        borderRadius:12,
        borderWidth:1,
        borderColor:"#27272a"
    },

    avatar:{
        width:38,
        height:38,
        borderRadius:12
    }

});