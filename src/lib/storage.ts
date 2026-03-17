import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN = 'access_token'
const REFRESH_TOKEN = 'refresh_token'

export const saveTokens = async (

  accessToken: string,

) => {
  console.log("accesstoken",accessToken)
  try{
  await SecureStore.setItemAsync(ACCESS_TOKEN, JSON.stringify(accessToken))
 // await SecureStore.setItemAsync(REFRESH_TOKEN, JSON.stringify(refreshToken))
  }catch(error){
    console.log("save token error..",error)
  }
}

export const getAccessToken = () =>
  SecureStore.getItemAsync(ACCESS_TOKEN)

export const getRefreshToken = () =>
  SecureStore.getItemAsync(REFRESH_TOKEN)

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN)
  await SecureStore.deleteItemAsync(REFRESH_TOKEN)
}