import { api } from "../store/api";
import { CreateProductRequest, ListingStatus, Product, ProductCondition, SellerDashBoardData, SellerStats } from "../types/types";

export const marketplaceApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getProducts: builder.query<{content: Product[],nextCursor: string | null,hasMore: boolean
      }, {category?: string,keyword?: string,sortBy?: string,sortOrder?: string,cursor?: string | null,limit?: number
      }
    >({query: ({ category, keyword,sortBy ,cursor,sortOrder,limit = 10,
      }) => ({
        url: `/public/products`,
        params: {category,keyword,sortBy,cursor,sortOrder,limit,
        },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
      
        const { cursor, ...rest } = queryArgs
        return { endpointName, ...rest }
      },

      merge: (currentCache, newItems) => {
        if (!currentCache.content) {
          currentCache.content = []
        }

        const existingIds = new Set(
          currentCache.content.map(p => p?.productId)
        )

        newItems.content.forEach(product => {
          if (!existingIds.has(product?.productId)) {
            currentCache.content.push(product)
          }
        })

        currentCache.nextCursor = newItems.nextCursor
        currentCache.hasMore = newItems.hasMore
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
    addProducts: builder.mutation<Product, { createProductRequest: CreateProductRequest; categoryId: string }>({
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
    getSellerDashboard:builder.query<SellerDashBoardData,{listingStatus:string,cursor:string}>({
       query: ({listingStatus,cursor}) => ({
        url: "/products/getSellerListingsStats",
        method:'GET',
        params:{listingStatus,cursor}
      }),
    })

  }),
});

export const { useGetProductsQuery, useAddProductsMutation, useGetProductConditionsQuery,useGetSellerDashboardQuery } = marketplaceApi