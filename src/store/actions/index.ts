import { api } from "@/src/network/api";

interface UserData {
     name: string; 
     email: string; 
     password: string; 
     college: string; 
     verified: boolean;
      role: string; }

interface UserCreds{
  email:string;
  password:string;

}
export const RegisterUser = (userData: UserData, setLoading: (loading: boolean) => void) => 
  async (dispatch: any) => {
    try {
      setLoading(true);

      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        college: userData.college,
        verified: userData.verified,
        role: userData.role
      };
       console.log(process.env.EXPO_PUBLIC_BACK_END_URL)
       
       
      const { data } = await api.post("/auth/register", payload,{headers: {'Content-Type':'application/json'}
});
        console.log("data",data)
    
      setLoading(false);
      
    } catch (error: any) {
      dispatch({type:"IS_ERROR",payload:error?.response?.data?.message})

    }finally{
      setLoading(false);
     
    }
  };
export const LoginUser=(userCreds:UserCreds,setLoading:(loading:boolean)=>void)=> async (dispatch:any)=>{
  try{
    setLoading(true);
    const payload={
      email:userCreds.email,
      password:userCreds.password,
    };
    const {data}=await api.post("auth/login",payload);
    dispatch({type:"LOGIN_USER",paylaod:data})
  }catch(error:any){
    dispatch({type:"IS_ERROR",payload:error?.response?.data?.message})
  }finally{
    setLoading(false);
  }
}
    
export const FetchCommunitties=(userId:number)=>async(dispatch:any)=>{
    
}
