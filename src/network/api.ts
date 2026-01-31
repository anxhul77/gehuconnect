import axios from "axios";
const url=process.env.EXPO_PUBLIC_BACK_END_URL
console.log("axios",url)
export const api=axios.create({
    baseURL:`${url}/api`,
     withCredentials: true,
     
}

)