import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCastMember } from '../api/castMembers'

export default function ActorDetail() {
  const { castId } = useParams()
  const navigate = useNavigate()
  const [cast, setCast] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const res = await getCastMember(castId)
        setCast(res.data)
      } catch (err) {
        console.error('Failed to load cast member', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [castId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void text-reel flex items-center justify-center font-display">
        Loading...
      </div>
    )
  }

  if (!cast) {
    return (
      <div className="min-h-screen bg-void text-reel flex items-center justify-center font-display">
        Cast member not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-reel px-4 md:px-8 py-10 font-display">
      <button onClick={() => navigate(-1)} className="text-smoke hover:text-reel mb-6 transition">
        ← Back
      </button>

      <div className="flex flex-col md:flex-row items-start gap-8 mb-10">
        <div className="w-40 h-40 rounded-full overflow-hidden bg-panel border border-panel-line flex items-center justify-center shrink-0">
          {cast.photo_url ? (
            <img src={cast.photo_url} alt={cast.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">{cast.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{cast.name}</h1>
          <p className="text-smoke">
            Appears in {cast.movies.length} title{cast.movies.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-extrabold mb-4">Titles</h2>
      {cast.movies.length === 0 ? (
        <p className="text-smoke">No titles found for this cast member yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cast.movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="cursor-pointer group"
            >
              <div className="aspect-video bg-panel rounded overflow-hidden border border-panel-line group-hover:ring-2 ring-flix-red group-hover:border-transparent transition">
                {movie.thumbnail_url ? (
                  <img src={movie.thumbnail_url} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-smoke text-sm text-center px-2">
                    {movie.title}
                  </div>
                )}
              </div>
              <p className="text-smoke text-sm mt-1 truncate group-hover:text-reel transition">{movie.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}