import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-void text-reel font-display">Loading...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}