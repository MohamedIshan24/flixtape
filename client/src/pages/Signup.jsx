import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BackgroundVideo from '../components/BackgroundVideo'
import FilmSprocket from '../components/FilmSprocket'

export default function Signup() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative font-display">
      <BackgroundVideo />

      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 text-flix-red text-2xl font-extrabold tracking-tight"
      >
        FLIXTAPE
      </Link>

      <div className="w-full max-w-md">
        <FilmSprocket variant="panel" className="rounded-t-md" />
        <div className="bg-panel/90 backdrop-blur-sm px-8 py-10 border-x border-panel-line">
          <p className="text-flix-red text-xs font-bold tracking-[0.3em] uppercase mb-2">
            Start recording
          </p>
          <h1 className="text-3xl font-extrabold text-reel mb-7">Create your account</h1>

          {error && (
            <div className="bg-flix-red/10 border border-flix-red/50 text-reel text-sm rounded px-3 py-2.5 mb-5">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="signup-email" className="sr-only">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-void border border-panel-line text-reel placeholder-smoke rounded px-4 py-3 outline-none focus:border-flix-red focus:ring-1 focus:ring-flix-red transition"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="sr-only">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-void border border-panel-line text-reel placeholder-smoke rounded px-4 py-3 outline-none focus:border-flix-red focus:ring-1 focus:ring-flix-red transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-flix-red hover:bg-flix-red-dim disabled:opacity-50 text-reel font-bold rounded px-4 py-3 transition"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-smoke mt-7 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-reel font-semibold hover:text-flix-red transition">
              Sign in
            </Link>
          </p>
        </div>
        <FilmSprocket variant="panel" className="rounded-b-md" />
      </div>
    </div>
  )
}
