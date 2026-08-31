import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/src/store/Store'

import { getRefreshToken, saveTokens } from '@/src/lib/storage'
import { logout, setCredentials } from './slices/auth.slice'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_BACK_END_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
      api.dispatch(logout())
      return result
    }

    const refreshResult = await baseQuery(
      {
        url: 'api/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      const { accessToken, refreshToken: newRefreshToken, user } =
        refreshResult.data as any

      await saveTokens(accessToken,)

      api.dispatch(
        setCredentials({
          user,
          token: accessToken,
        })
      )

      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Post', 'Comment', 'PullRequest'],
  endpoints: () => ({}),
})