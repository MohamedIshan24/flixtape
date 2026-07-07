import { useNavigate } from 'react-router-dom'

export default function MovieRow({ title, movies }) {
  const navigate = useNavigate()

  if (!movies || movies.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-semibold mb-3 px-4 md:px-8">{title}</h2>
      <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-2 scrollbar-hide">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="shrink-0 w-40 md:w-48 cursor-pointer group"
          >
            <div className="aspect-video bg-neutral-800 rounded overflow-hidden group-hover:ring-2 ring-white transition">
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
            </div>
            <p className="text-neutral-300 text-sm mt-1 truncate group-hover:text-white">
              {movie.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}