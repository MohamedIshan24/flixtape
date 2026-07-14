import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'

const HOVER_DELAY_MS = 500

export default function MovieRow({ title, movies, showProgress = false }) {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState(null)
  const [activePreviewId, setActivePreviewId] = useState(null)
  const hoverTimerRef = useRef(null)

  if (!movies || movies.length === 0) return null

  function handleMouseEnter(movieId, trailerUrl) {
    setHoveredId(movieId)
    if (!trailerUrl) return
    hoverTimerRef.current = setTimeout(() => {
      setActivePreviewId(movieId)
    }, HOVER_DELAY_MS)
  }

  function handleMouseLeave() {
    setHoveredId(null)
    setActivePreviewId(null)
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  return (
    <div className="mb-8 font-display">
      <h2 className="text-reel text-xl font-bold mb-3 px-4 md:px-8">{title}</h2>
      <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-2 scrollbar-hide">
        {movies.map((item) => {
          const movie = item.movie || item
          const progressSeconds = item.progress_seconds
          const progressPct =
            showProgress && progressSeconds && movie.duration
              ? Math.min((progressSeconds / (movie.duration * 60)) * 100, 100)
              : null

          const trailerUrl = movie.trailer_url || movie.video_url
          const isPreviewActive = activePreviewId === movie.id

          return (
            <div
              key={movie.id}
              onClick={() => navigate(`/movie/${movie.id}`)}
              onMouseEnter={() => handleMouseEnter(movie.id, trailerUrl)}
              onMouseLeave={handleMouseLeave}
              className="shrink-0 w-40 md:w-48 cursor-pointer group"
            >
              <div
                className={`relative aspect-video bg-panel rounded overflow-hidden border border-panel-line transition ${
                  hoveredId === movie.id ? 'ring-2 ring-flix-red border-transparent scale-105' : ''
                }`}
              >
                {isPreviewActive ? (
                  <ReactPlayer
                    url={trailerUrl}
                    playing
                    muted
                    loop
                    width="100%"
                    height="100%"
                    config={{ youtube: { playerVars: { controls: 0, modestbranding: 1 } } }}
                  />
                ) : movie.thumbnail_url ? (
                  <img
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-smoke text-sm text-center px-2">
                    {movie.title}
                  </div>
                )}
                {progressPct !== null && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-panel-line">
                    <div className="h-full bg-flix-red" style={{ width: `${progressPct}%` }} />
                  </div>
                )}
              </div>
              <p className="text-smoke text-sm mt-1 truncate group-hover:text-reel transition">
                {movie.title}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}