import { api } from "../store/api";
import { Subject } from "../types/types";

export const AcadmecisApi=api.injectEndpoints(
    {
     endpoints:(builder)=>({
        getSubject:builder.query<Subject,string>({
            query:(semesterId)=>({
             method:"GET",
             url:`/academics/subjects/${semesterId}`
            })}
     )})
    })
export const {useGetSubjectQuery}=AcadmecisApi;