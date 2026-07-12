import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function GuestRoute({ children }) {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>
  }

  if (token) {
    return <Navigate to="/browse" replace />
  }

  return children
}