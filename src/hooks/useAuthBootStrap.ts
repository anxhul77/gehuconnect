import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getAccessToken } from '../lib/storage'
import { setCredentials } from '../store/slices/auth.slice'

export const useAuthBootstrap = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const bootstrap = async () => {
      const token = await getAccessToken()
      if (token) {
        dispatch(setCredentials({ token, user: null }))
      }
    }
    bootstrap()
  }, [])
}