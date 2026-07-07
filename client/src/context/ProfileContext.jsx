import { createContext, useContext, useReducer, useEffect } from 'react'
import { getProfiles as getProfilesApi } from '../api/profiles'
import { useAuth } from './AuthContext'

const ProfileContext = createContext(null)

const initialState = {
  profiles: [],
  activeProfile: null,
  isLoading: true,
  error: null,
}

function profileReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, profiles: action.payload }
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload }
    case 'SET_ACTIVE_PROFILE':
      return { ...state, activeProfile: action.payload }
    case 'CLEAR_ACTIVE_PROFILE':
      return { ...state, activeProfile: null }
    case 'ADD_PROFILE':
      return { ...state, profiles: [...state.profiles, action.payload] }
    case 'REMOVE_PROFILE':
      return { ...state, profiles: state.profiles.filter((p) => p.id !== action.payload) }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function ProfileProvider({ children }) {
  const [state, dispatch] = useReducer(profileReducer, initialState)
  const { token } = useAuth()

  useEffect(() => {
    async function fetchProfiles() {
      if (!token) {
        dispatch({ type: 'RESET' })
        return
      }
      dispatch({ type: 'FETCH_START' })
      try {
        const res = await getProfilesApi()
        dispatch({ type: 'FETCH_SUCCESS', payload: res.data })

        const storedId = localStorage.getItem('flixtape_active_profile')
        if (storedId) {
          const match = res.data.find((p) => p.id === storedId)
          if (match) {
            dispatch({ type: 'SET_ACTIVE_PROFILE', payload: match })
          }
        }
      } catch (err) {
        dispatch({ type: 'FETCH_FAILURE', payload: err.response?.data?.detail || 'Failed to load profiles' })
      }
    }
    fetchProfiles()
  }, [token])

  function selectProfile(profile) {
    localStorage.setItem('flixtape_active_profile', profile.id)
    dispatch({ type: 'SET_ACTIVE_PROFILE', payload: profile })
  }

  function clearActiveProfile() {
    localStorage.removeItem('flixtape_active_profile')
    dispatch({ type: 'CLEAR_ACTIVE_PROFILE' })
  }

  function addProfile(profile) {
    dispatch({ type: 'ADD_PROFILE', payload: profile })
  }

  function removeProfile(profileId) {
    dispatch({ type: 'REMOVE_PROFILE', payload: profileId })
    if (state.activeProfile?.id === profileId) {
      clearActiveProfile()
    }
  }

  return (
    <ProfileContext.Provider
      value={{ ...state, selectProfile, clearActiveProfile, addProfile, removeProfile }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfiles() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider')
  }
  return context
}