import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BackgroundVideo from '../components/BackgroundVideo'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await signup(email, password)
      navigate('/profiles')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <BackgroundVideo />

      <Link to="/" className="absolute top-6 left-6 text-red-600 text-2xl font-bold tracking-wide">
        FLIXTAPE
      </Link>

      <div className="w-full max-w-md bg-black/75 backdrop-blur-sm p-8 rounded-md border border-neutral-800">
        <h1 className="text-3xl font-bold text-white mb-6">Sign Up</h1>

        {error && (
          <div className="bg-orange-600/20 border border-orange-600 text-orange-200 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-800 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-800 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
            required
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded px-4 py-3 transition"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-neutral-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}