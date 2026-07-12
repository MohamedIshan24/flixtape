import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMovies } from '../api/movies'

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-black to-red-950/40" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(220,38,38,0.3) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(220,38,38,0.2) 0%, transparent 40%)',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/40 to-black" />

        <div className="relative z-10 text-center px-4 max-w-2xl">
          <h1 className="text-red-600 text-4xl md:text-6xl font-bold tracking-wide mb-4">
            FLIXTAPE
          </h1>
          <p className="text-lg md:text-2xl font-medium mb-3">
            Unlimited movies, TV shows, and more.
          </p>
          <p className="text-neutral-300 mb-8">
            Personalized profiles. Real recommendations. No ads, ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded text-lg transition w-full sm:w-auto"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-neutral-500 hover:border-white text-white font-semibold px-8 py-3 rounded text-lg transition w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Trending row */}
      {trending.length > 0 && (
        <div className="px-4 md:px-8 py-16 -mt-24 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Trending Now</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {trending.map((movie) => (
              <div key={movie.id} className="w-40 md:w-48 shrink-0">
                <div className="aspect-video bg-neutral-800 rounded overflow-hidden">
                  {movie.thumbnail_url ? (
                    <img src={movie.thumbnail_url} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm text-center px-2">
                      {movie.title}
                    </div>
                  )}
                </div>
                <p className="text-neutral-300 text-sm mt-2 truncate">{movie.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="px-4 md:px-8 py-16 bg-neutral-950">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">Why Flixtape</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-600/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-red-500">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-4 py-20 text-center border-t border-neutral-800">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to watch?</h2>
        <p className="text-neutral-400 mb-8">Create your account and start streaming in seconds.</p>
        <Link
          to="/signup"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded text-lg transition inline-block"
        >
          Sign Up Now
        </Link>
      </div>
    </div>
  )
}