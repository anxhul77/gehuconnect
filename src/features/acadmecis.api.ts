import { api } from "../store/api";
import { Course, Subject } from "../types/types";

export type MaterialType = "PDF" | "VIDEO" | "DOCUMENT" | "PPT" | "IMAGE" | "OTHER";

export interface StudyMaterialDto {
  studyMaterialId?: number;
  title: string;
  type: MaterialType;
  fileUrl: string;
  description: string;
  subject?: any;
  uploadedBy?: any;
}

export const AcadmecisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubject: builder.query<Subject, string>({
      query: (semesterId) => ({
        method: "GET",
        url: `/academics/subjects/${semesterId}`,
      }),
    }),
    getCourses: builder.query<Course, { keyword: string; limit: string; cursor: string }>({
      query: ({ keyword, limit, cursor }) => ({
        method: "GET",
        url: "/academics/courses",
        params: { cursor, keyword, limit },
      }),
    }),
    getAcadmicsPresigned: builder.mutation<
      { presignedUrl: string; key: string },
      { mimeType: string; fileSize: number }
    >({
      query: (data) => ({
        url: "/media/getAcadmicsPresigned",
        method: "POST",
        body: data,
      }),
    }),
    addStudyMaterial: builder.mutation<
      StudyMaterialDto,
      { subjectId: number; material: StudyMaterialDto }
    >({
      query: ({ subjectId, material }) => ({
        url: `/academics/material/${subjectId}`,
        method: "POST",
        body: material,
      }),
    }),
  }),
});
export const {
  useGetSubjectQuery,
  useGetCoursesQuery,
  useGetAcadmicsPresignedMutation,
  useAddStudyMaterialMutation,
} = AcadmecisApi;