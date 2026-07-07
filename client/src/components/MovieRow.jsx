import { useNavigate } from 'react-router-dom'

export default function MovieRow({ title, movies, showProgress = false }) {
  const navigate = useNavigate()

  if (!movies || movies.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-semibold mb-3 px-4 md:px-8">{title}</h2>
      <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-2 scrollbar-hide">
        {movies.map((item) => {
          const movie = item.movie || item
          const progressSeconds = item.progress_seconds
          const progressPct =
            showProgress && progressSeconds && movie.duration
              ? Math.min((progressSeconds / (movie.duration * 60)) * 100, 100)
              : null

          return (
            <div
              key={movie.id}
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="shrink-0 w-40 md:w-48 cursor-pointer group"
            >
              <div className="relative aspect-video bg-neutral-800 rounded overflow-hidden group-hover:ring-2 ring-white transition">
                {movie.thumbnail_url ? (
                  <img
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm text-center px-2">
                    {movie.title}
                  </div>
                )}
                {progressPct !== null && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-600">
                    <div className="h-full bg-red-600" style={{ width: `${progressPct}%` }} />
                  </div>
                )}
              </div>
              <p className="text-neutral-300 text-sm mt-1 truncate group-hover:text-white">
                {movie.title}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}