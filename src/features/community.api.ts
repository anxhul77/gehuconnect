import { api } from "../store/api";
import { Communities, Community } from "../types/types";

export const communityApi=api.injectEndpoints(
    {
     endpoints:(builder)=>({
        getCommunities:builder.query<Communities[],void>({
            query:()=>({
             method:"GET",
             url:"/community/getAllCommunities"
            })
        }
      
        ),
        getCommunity:builder.query<Community,string>({
            query:(id)=>({
               method:"GET",
               url:`/community/getCommunity/${id}`
            }
        )})
     })
    }
)
export const {useGetCommunitiesQuery,useGetCommunityQuery}=communityApi