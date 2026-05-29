import { View, Pressable, Text } from "react-native";
import React from "react";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import FormInputField from "./FormInputField";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/src/features/auth.api";

const InputForm = () => {
  const router = useRouter();
  const [login, { isLoading, error, isSuccess },] = useLoginMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mode: "onChange",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {

      const payload = {
        "email": data.email,
        "password": data.password
      }
      console.log("payload        ................................................................", payload)
      await login(payload).unwrap()
      if (isSuccess) {
        console.log(isSuccess)
        router.push("/(drawer)/(tabs)/home")
      }
    }
    catch (error) {
      console.log(error)
    }
  };

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-[#0D0D0D] pb-[50px] w-full">
      <Text className="text-white pb-9 text-5xl font-bold">Login</Text>

      <FormInputField
        icon={<FontAwesome name="at" size={18} color="white" />}
        placeholder="Email"
        name="email"
        control={control}
        rules={{
          required: "Email is required",
          maxnLength: {
            value: 254,
            message: "Email is too long",
          },
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address",
          },

        }}
        error={errors.email?.message}
      />

      <FormInputField
        icon={<Entypo name="lock" size={20} color="white" />}
        placeholder="Password"
        name="password"
        secure
        control={control}
        rules={{
          required: "Password is required",
          minLength: {
            value: 5,
            message: "Minimum 5 characters",
          },
        }}
        error={errors.password?.message}
      />

      <Pressable
        onPress={handleSubmit(onSubmit)}
        className="bg-[#DB4025] h-14 w-[85%] rounded-[25px] justify-center items-center mt-4"
      >
        <Text className="text-white font-bold text-lg">Sign in</Text>
      </Pressable>

      <View className="bg-white h-14 w-[85%] rounded-[25px] justify-center items-center mt-4">
        <Text className="text-black font-bold text-lg">
          Continue with Google
        </Text>
      </View>

      <Text className="text-white mt-4">
        Don’t have an account? Signup
      </Text>
    </View>
  );
};

export default InputForm;
