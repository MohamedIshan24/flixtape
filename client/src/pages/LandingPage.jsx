import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getMovies } from '../api/movies'
import Footer from '../components/Footer'
import FilmSprocket from '../components/FilmSprocket'

const FEATURES = [
  {
    title: 'Personalized Recommendations',
    description: 'Get suggestions based on genres you actually watch, not generic charts.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
    ),
  },
  {
    title: 'Multiple Profiles',
    description: 'Up to 5 profiles per account, each with its own watch history and list.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    ),
  },
  {
    title: 'Rate & Review',
    description: 'Rate titles 1-10 and see real average ratings from the community.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    ),
  },
  {
    title: 'Watch Anywhere You Left Off',
    description: 'Continue Watching picks up exactly where you paused, per profile.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    ),
  },
]

export default function LandingPage() {
  const [trending, setTrending] = useState([])
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const res = await getMovies({ trending: true })
        setTrending(res.data.slice(0, 10))
      } catch (err) {
        console.error('Failed to load trending titles', err)
      }
    }
    load()
  }, [])

  function handleGetStarted(e) {
    e.preventDefault()
    const params = email ? `?email=${encodeURIComponent(email)}` : ''
    navigate(`/signup${params}`)
  }

  return (
    <div className="min-h-screen bg-void text-reel font-display">
      {/* Nav */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 md:px-10 py-6">
        <span className="text-flix-red text-2xl font-extrabold tracking-tight">FLIXTAPE</span>
        <Link
          to="/login"
          className="border border-smoke/40 hover:border-reel text-reel font-semibold px-5 py-2 rounded text-sm transition"
        >
          Sign In
        </Link>
      </div>

      {/* Hero */}
      <div className="relative h-[92vh] flex items-center overflow-hidden bg-void">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 65% 70% at 12% 25%, rgba(229,9,20,0.22) 0%, transparent 55%), radial-gradient(ellipse 55% 55% at 90% 80%, rgba(229,9,20,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-void/30 to-void" />
        <div className="grain-overlay" />
        <div className="scanlines" />

        <div className="relative z-10 px-4 md:px-10 max-w-2xl">
          <p className="text-flix-red text-xs md:text-sm font-bold tracking-[0.35em] uppercase mb-4">
            Now recording
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
            Movies, series, and a watchlist that's actually yours.
          </h1>
          <p className="text-smoke text-base md:text-lg mb-8 max-w-xl">
            No cable box, no ads, no algorithm guessing games — just the titles you
            queue up, rated and ranked by the people watching them. Cancel anytime.
          </p>

          <form onSubmit={handleGetStarted} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-panel/80 border border-panel-line text-reel placeholder-smoke rounded px-4 py-3.5 outline-none focus:border-flix-red focus:ring-1 focus:ring-flix-red transition"
            />
            <button
              type="submit"
              className="bg-flix-red hover:bg-flix-red-dim text-reel font-bold px-6 py-3.5 rounded transition whitespace-nowrap"
            >
              Get Started &rarr;
            </button>
          </form>
        </div>
      </div>

      <FilmSprocket />

      {/* Trending row */}
      {trending.length > 0 && (
        <div className="px-4 md:px-10 py-16 bg-void">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-7">On the Reel Right Now</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {trending.map((movie, i) => (
              <div key={movie.id} className="w-36 md:w-44 shrink-0 group">
                <div className="relative aspect-2/3 bg-panel rounded overflow-hidden border border-panel-line group-hover:border-flix-red transition">
                  {movie.thumbnail_url ? (
                    <img
                      src={movie.thumbnail_url}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-smoke text-sm text-center px-2">
                      {movie.title}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-flix-red text-3xl font-extrabold [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
                    {i + 1}
                  </span>
                </div>
                <p className="text-smoke text-sm mt-2 truncate group-hover:text-reel transition">
                  {movie.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <FilmSprocket variant="panel" />

      {/* Features */}
      <div className="px-4 md:px-10 py-16 bg-void-soft">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-10 text-center">Why Flixtape</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-panel border-l-4 border-flix-red rounded px-5 py-6"
            >
              <div className="w-11 h-11 mb-4 rounded-full bg-flix-red/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-flix-red">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-smoke text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-4 py-20 text-center border-t border-panel-line bg-void">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Ready to press play?</h2>
        <p className="text-smoke mb-8">Create your account and start streaming in seconds.</p>
        <Link
          to="/signup"
          className="bg-flix-red hover:bg-flix-red-dim text-reel font-bold px-8 py-3 rounded text-lg transition inline-block"
        >
          Sign Up Now
        </Link>
      </div>

      <Footer />
    </div>
  )
}
