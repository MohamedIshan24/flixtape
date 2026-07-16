import { createContext, useContext, useReducer, useEffect } from 'react'
import { login as loginApi, signup as signupApi, getCurrentUser } from '../api/auth'

const AuthContext = createContext(null)

const initialState = {
  token: localStorage.getItem('flixtape_token') || null,
  user: null,
  isLoading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null }
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, token: action.payload.token, user: action.payload.user, error: null }
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false, error: action.payload }
    case 'LOGOUT':
      return { ...state, token: null, user: null, isLoading: false, error: null }
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    async function loadUser() {
      if (!state.token) {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
        return
      }
      try {
        const res = await getCurrentUser()
        dispatch({ type: 'SET_USER', payload: res.data })
      } catch (err) {
        localStorage.removeItem('flixtape_token')
        dispatch({ type: 'LOGOUT' })
      }
    }
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(email, password) {
    const res = await loginApi(email, password)
    const token = res.data.access_token
    localStorage.setItem('flixtape_token', token)
    const userRes = await getCurrentUser()
    dispatch({ type: 'AUTH_SUCCESS', payload: { token, user: userRes.data } })
  }

  async function signup(email, password) {
    await signupApi(email, password)
    await login(email, password)
  }

  function logout() {
    localStorage.removeItem('flixtape_token')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}