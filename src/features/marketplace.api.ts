import { api } from "../store/api";
import { CreateProductRequest, ProductCondition, ProductPaginatedResponse, SellerDashBoardData, ProductCardResponse, ProductCurousalResponse, } from "../types/types";

export const marketplaceApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getProducts: builder.query<
      ProductPaginatedResponse
      , {
        category?: string, keyword?: string, sortBy?: string, sortOrder?: string, cursor?: string | null, limit?: number
      }
    >({
      query: ({ category, keyword, sortBy, cursor, sortOrder, limit = 10,
      }) => ({
        url: `/public/products`,
        params: {
          category, keyword, sortBy: sortBy || "score", cursor, sortOrder, limit,
        },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {

        const { cursor, ...rest } = queryArgs
        return { endpointName, ...rest }
      },

      merge: (currentCache, newItems) => {
        if (!currentCache.products) {
          currentCache.products = []
        }

        const existingIds = new Set(
          currentCache.products.map(p => p?.productId)
        )

        newItems.products.forEach(product => {
          if (!existingIds.has(product?.productId)) {
            currentCache.products.push(product)
          }
        })

        currentCache.nextCursor = newItems.nextCursor
        currentCache.hasNext = newItems.hasNext
      },

      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.category !== previousArg?.category ||
          currentArg?.keyword !== previousArg?.keyword ||
          currentArg?.sortBy !== previousArg?.sortBy ||
          currentArg?.sortOrder !== previousArg?.sortOrder
        )
      }
    }),
    getProductCurousal: builder.query<ProductCurousalResponse, { productId?: string }>({
      query: ({ productId }) => ({

        url: `/public/productCurousal/${productId}`,


      })
    }),
    addProducts: builder.mutation<ProductCardResponse, { createProductRequest: CreateProductRequest; categoryId: string }>({
      query: ({ createProductRequest, categoryId }) => ({
        url: `/admin/products/${categoryId}/product`,
        method: "POST",
        body: createProductRequest,
      }),
    }),

    getProductConditions: builder.query<ProductCondition[], void>({
      query: () => ({
        url: "/productCondition/getAllProductConditions",
      }),
    }),
    getSellerDashboard: builder.query<SellerDashBoardData, { listingStatus: string, cursor: string }>({
      query: ({ listingStatus, cursor }) => ({
        url: "/products/getSellerListingsStats",
        method: 'GET',
        params: { listingStatus, cursor }
      }),
    }),
    likeProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/public/products/like`,
        method: "POST",
        params: { productId },
      }),
    }),
    unlikeProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/public/products/unlike`,
        method: "POST",
        params: { productId },
      }),
    })

  }),
});

export const { useGetProductsQuery, useAddProductsMutation, useGetProductConditionsQuery,
  useGetProductCurousalQuery, useGetSellerDashboardQuery, useLikeProductMutation, useUnlikeProductMutation } = marketplaceApi