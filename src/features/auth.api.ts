import { api } from '@/src/store/api'
import { setCredentials } from '@/src/store/slices/auth.slice'
import { saveTokens } from '@/src/lib/storage'

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { user: any; accessToken: string; refreshToken: string },
      { email: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        
        const { data } = await queryFulfilled
      
        await saveTokens(data.accessToken)

        dispatch(
          setCredentials({
            user: data.user,
            token: data.accessToken,
          })
        )
      },
    }),
  }),
})

export const { useLoginMutation, } = authApi