import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { getMovie } from '../api/movies'
import { getMyList, addToMyList, removeFromMyList } from '../api/myList'
import { upsertWatchHistory, getWatchHistory } from '../api/watchHistory'
import { useProfiles } from '../context/ProfileContext'

export default function MovieDetail() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const { activeProfile } = useProfiles()

  const [movie, setMovie] = useState(null)
  const [isInMyList, setIsInMyList] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [startTime, setStartTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const lastSavedRef = useRef(0)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [movieRes, listRes, historyRes] = await Promise.all([
          getMovie(movieId),
          getMyList(activeProfile.id),
          getWatchHistory(activeProfile.id),
        ])
        setMovie(movieRes.data)
        setIsInMyList(listRes.data.some((entry) => entry.movie.id === movieId))

        const existingProgress = historyRes.data.find((entry) => entry.movie.id === movieId)
        if (existingProgress) {
          setStartTime(existingProgress.progress_seconds)
        }
      } catch (err) {
        console.error('Failed to load movie detail', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (activeProfile) load()
  }, [movieId, activeProfile])

  const handleProgress = useCallback(
    (state) => {
      const seconds = Math.floor(state.playedSeconds)
      if (Math.abs(seconds - lastSavedRef.current) >= 10) {
        lastSavedRef.current = seconds
        upsertWatchHistory(activeProfile.id, movieId, seconds).catch((err) =>
          console.error('Failed to save watch progress', err)
        )
      }
    },
    [activeProfile, movieId]
  )

  async function handleToggleMyList() {
    try {
      if (isInMyList) {
        await removeFromMyList(activeProfile.id, movieId)
        setIsInMyList(false)
      } else {
        await addToMyList(activeProfile.id, movieId)
        setIsInMyList(true)
      }
    } catch (err) {
      console.error('Failed to update My List', err)
    }
  }

  if (isLoading || !movie) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-4">
        <button onClick={() => navigate(-1)} className="text-neutral-300 hover:text-white mb-4">
          ← Back
        </button>
      </div>

      <div className="px-4 md:px-8">
        <div className="aspect-video bg-neutral-900 rounded overflow-hidden mb-6">
          {movie.video_url ? (
            <ReactPlayer
              url={movie.video_url}
              controls
              playing={isPlaying}
              width="100%"
              height="100%"
              onStart={() => setIsPlaying(true)}
              onProgress={handleProgress}
              progressInterval={5000}
              config={{
                youtube: {
                  playerVars: { start: startTime },
                },
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500">
              No video available for this title yet
            </div>
          )}
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center gap-3 text-neutral-400 text-sm mb-4">
            {movie.release_year && <span>{movie.release_year}</span>}
            {movie.duration && <span>{movie.duration} min</span>}
            {movie.rating > 0 && <span>★ {movie.rating.toFixed(1)}</span>}
          </div>
          <p className="text-neutral-200 mb-6">{movie.description}</p>

          {movie.director && (
            <p className="text-neutral-400 text-sm mb-2">
              <span className="text-neutral-500">Director: </span>
              {movie.director}
            </p>
          )}

          {movie.cast_members?.length > 0 && (
            <p className="text-neutral-400 text-sm mb-6">
              <span className="text-neutral-500">Cast: </span>
              {movie.cast_members.map((c) => c.name).join(', ')}
            </p>
          )}

          <button
            onClick={handleToggleMyList}
            className={`px-6 py-3 rounded font-semibold transition ${
              isInMyList
                ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {isInMyList ? '✓ In My List' : '+ Add to My List'}
          </button>
        </div>
      </div>
    </div>
  )
}