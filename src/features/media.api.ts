
import { api } from "../store/api";

export const MediaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPresignedForProducts: builder.mutation<
      { presignedUrl: string; key: string }[],
      { data: { mimeType: string; fileSize: number }[] }
    >({
      query: ({ data }) => ({
        url: "/media/getProductsPresigned",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetPresignedForProductsMutation } = MediaApi;