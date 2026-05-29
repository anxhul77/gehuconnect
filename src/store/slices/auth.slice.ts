import { AuthState, User, ErpUserData } from '@/src/types/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user
      state.accessToken = action.payload.token
      state.isAuthenticated = true
    },
    logout(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },
    setErpData(state, action: PayloadAction<ErpUserData>) {
      if (state.user) {
        state.user.isErpLoggedIn = true
        state.user.erpData = action.payload
      }
    },
  },
})

export const { setCredentials, logout, setErpData } = authSlice.actions
export default authSlice.reducer