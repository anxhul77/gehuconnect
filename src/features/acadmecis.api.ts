import { api } from "../store/api";
import { Course, Subject } from "../types/types";

export const AcadmecisApi=api.injectEndpoints(
    {
     endpoints:(builder)=>({
        getSubject:builder.query<Subject,string>({
            query:(semesterId)=>({
             method:"GET",
             url:`/academics/subjects/${semesterId}`
            })}
            
     ),          getCourses:builder.query<Course,{keyword:string ,limit:string ,cursor:string}>({
                 query:({keyword ,limit ,cursor})=>({
                  method:"GET",
                  url:"/academics/courses",
                  params:{cursor,keyword,limit}
                 })
             }
           
             )
    })
    })
export const {useGetSubjectQuery,useGetCoursesQuery}=AcadmecisApi;