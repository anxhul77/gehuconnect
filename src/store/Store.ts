import { configureStore } from '@reduxjs/toolkit'
import authReducer from './reducers/authReducer'
import commentsReducer from './reducers/commentsReducer'
import postsReducer from './reducers/postsReducer'
import { errorReducer } from './reducers/errorReducer'


export const store = configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer,
    auth: authReducer,
    errors:errorReducer
  }
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store