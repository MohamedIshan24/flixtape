import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BackgroundVideo from '../components/BackgroundVideo'
import FilmSprocket from '../components/FilmSprocket'

export default function Login() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/profiles')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
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
            Welcome back
          </p>
          <h1 className="text-3xl font-extrabold text-reel mb-7">Sign in</h1>

          {error && (
            <div className="bg-flix-red/10 border border-flix-red/50 text-reel text-sm rounded px-3 py-2.5 mb-5">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="sr-only">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-void border border-panel-line text-reel placeholder-smoke rounded px-4 py-3 outline-none focus:border-flix-red focus:ring-1 focus:ring-flix-red transition"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">Password</label>
              <input
                id="login-password"
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
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-smoke mt-7 text-sm">
            New to Flixtape?{' '}
            <Link to="/signup" className="text-reel font-semibold hover:text-flix-red transition">
              Create an account
            </Link>
          </p>
        </div>
        <FilmSprocket variant="panel" className="rounded-b-md" />
      </div>
    </div>
  )
}
