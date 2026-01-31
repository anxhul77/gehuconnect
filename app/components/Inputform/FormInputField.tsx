import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Controller } from "react-hook-form";

type Props = {
  icon: React.ReactNode;
  placeholder: string;
  name: string;
  control: any;
  rules?: any;
  secure?: boolean;
  error?: string;
};

const FormInputField = ({
  icon,
  placeholder,
  name,
  control,
  rules,
  secure = false,
  error,
}: Props) => {
  return (
    <View className="w-full items-center">
      <View style={styles.outer}>
        <LinearGradient
          colors={["rgba(0,0,0,0.85)", "#0A0A0A"]}
          style={styles.topInset}
        />

        <View style={styles.inner}>
          {icon}

          <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.45)"
                secureTextEntry={secure}
                style={styles.input}
                selectionColor="#3B82F6"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
        </View>

        <LinearGradient
          colors={["rgba(0,0,0,0.85)", "#0A0A0A"]}
          style={styles.bottomInset}
        />
      </View>

     
      {error && (
        <Text className="text-red-500 text-sm mt-1 self-start ml-14">
          {error}
        </Text>
      )}
    </View>
  );
};

export default FormInputField;



const styles = StyleSheet.create({
  outer: {
    width: "85%",
    height: 56,
    borderRadius: 28,
    backgroundColor: "#050505",
    overflow: "hidden",
  },

  inner: {
    flex: 1,
    margin: 10,
    borderRadius: 35,
 backgroundColor:"#0A0A0A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    color: "white",
    fontSize: 15,
    lineHeight: 20,      
    paddingVertical: 0,  
  },

  topInset: {
    position: "absolute",
    top: 0,
    left:20 ,
    right: 20,
    bottom:20,
    height: 18,
    zIndex: 2,
  },
  
  bottomInset: {
    position: "absolute",
    top: 0,
    left:20 ,
    right: 20,
    bottom:20,
    height: 18,
    zIndex: 2,
  },
});
