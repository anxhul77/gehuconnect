import { api } from "../store/api";
import { Category } from "../types/types";

export const CategoryApi=api.injectEndpoints(
    {
     endpoints:(builder)=>({
        getCategories:builder.query<Category,void>({
            query:()=>({
             method:"GET",
             url:"/public/category/getAllCategory"
            })}
     )})
    })
export const {useGetCategoriesQuery}=CategoryApi;