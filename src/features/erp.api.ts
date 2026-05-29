import { api } from '@/src/store/api'

export interface ErpSession {
  cookies: string;
  token: string;
}

export interface ErpCapchaResponse {
  captchImageUrl: string;
  cookie: string;
  token: string;
}

export interface ErpLoginRequest {
  username: string;
  password: string;
  captcha: string;
  session: ErpSession;
}

export const erpApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCaptcha: builder.query<ErpCapchaResponse, void>({
      query: () => ({
        url: '/erp',
        method: 'GET',
      }),

      providesTags: ['User'],
    }),
    erpLogin: builder.mutation<string, ErpLoginRequest>({
      query: (body) => ({
        url: '/erp',
        method: 'POST',
        body,
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
})

export const { useGetCaptchaQuery, useErpLoginMutation } = erpApi
