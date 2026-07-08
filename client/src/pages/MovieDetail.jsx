import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  const [selectedSeasonId, setSelectedSeasonId] = useState(null)
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null)

  const lastSavedRef = useRef(0)

  const isSeries = movie?.type === 'series'

  const selectedSeason = useMemo(
    () => movie?.seasons?.find((s) => s.id === selectedSeasonId) || null,
    [movie, selectedSeasonId]
  )

  const selectedEpisode = useMemo(
    () => selectedSeason?.episodes?.find((e) => e.id === selectedEpisodeId) || null,
    [selectedSeason, selectedEpisodeId]
  )

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [movieRes, listRes, historyRes] = await Promise.all([
          getMovie(movieId),
          getMyList(activeProfile.id),
          getWatchHistory(activeProfile.id),
        ])
        const movieData = movieRes.data
        setMovie(movieData)
        setIsInMyList(listRes.data.some((entry) => entry.movie.id === movieId))

        const historyForMovie = historyRes.data.filter((entry) => entry.movie.id === movieId)

        if (movieData.type === 'series' && movieData.seasons?.length > 0) {
          const episodeHistory = historyForMovie.find((entry) => entry.episode_id)
          if (episodeHistory) {
            const season = movieData.seasons.find((s) =>
              s.episodes.some((e) => e.id === episodeHistory.episode_id)
            )
            if (season) {
              setSelectedSeasonId(season.id)
              setSelectedEpisodeId(episodeHistory.episode_id)
              setStartTime(episodeHistory.progress_seconds)
            }
          } else {
            const firstSeason = movieData.seasons[0]
            setSelectedSeasonId(firstSeason.id)
            setSelectedEpisodeId(firstSeason.episodes[0]?.id || null)
          }
        } else {
          const plainHistory = historyForMovie.find((entry) => !entry.episode_id)
          if (plainHistory) {
            setStartTime(plainHistory.progress_seconds)
          }
        }
      } catch (err) {
        console.error('Failed to load movie detail', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (activeProfile) load()
  }, [movieId, activeProfile])

  function handleSelectEpisode(seasonId, episodeId) {
    setSelectedSeasonId(seasonId)
    setSelectedEpisodeId(episodeId)
    setStartTime(0)
    lastSavedRef.current = 0
    setIsPlaying(false)
  }

  const handleProgress = useCallback(
    (state) => {
      const seconds = Math.floor(state.playedSeconds)
      if (Math.abs(seconds - lastSavedRef.current) >= 10) {
        lastSavedRef.current = seconds
        upsertWatchHistory(
          activeProfile.id,
          movieId,
          seconds,
          isSeries ? selectedEpisodeId : null
        ).catch((err) => console.error('Failed to save watch progress', err))
      }
    },
    [activeProfile, movieId, isSeries, selectedEpisodeId]
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

  const videoUrl = isSeries ? selectedEpisode?.video_url : movie.video_url

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-4">
        <button onClick={() => navigate(-1)} className="text-neutral-300 hover:text-white mb-4">
          ← Back
        </button>
      </div>

      <div className="px-4 md:px-8">
        <div className="aspect-video bg-neutral-900 rounded overflow-hidden mb-6">
          {videoUrl ? (
            <ReactPlayer
              key={selectedEpisodeId || movie.id}
              url={videoUrl}
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
              {isSeries ? 'No video available for this episode yet' : 'No video available for this title yet'}
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

        {isSeries && movie.seasons?.length > 0 && (
          <div className="max-w-3xl mt-10 mb-10">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-bold">Episodes</h2>
              {movie.seasons.length > 1 && (
                <select
                  value={selectedSeasonId || ''}
                  onChange={(e) => {
                    const season = movie.seasons.find((s) => s.id === e.target.value)
                    handleSelectEpisode(season.id, season.episodes[0]?.id || null)
                  }}
                  className="bg-neutral-800 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
                >
                  {movie.seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      Season {season.season_number}
                      {season.title ? ` — ${season.title}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              {selectedSeason?.episodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleSelectEpisode(selectedSeason.id, episode.id)}
                  className={`flex items-center gap-4 p-3 rounded cursor-pointer transition ${
                    episode.id === selectedEpisodeId
                      ? 'bg-neutral-800 ring-1 ring-red-600'
                      : 'bg-neutral-900 hover:bg-neutral-800'
                  }`}
                >
                  <div className="w-24 h-14 shrink-0 bg-neutral-700 rounded overflow-hidden flex items-center justify-center text-neutral-500 text-xs">
                    {episode.thumbnail_url ? (
                      <img
                        src={episode.thumbnail_url}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      `E${episode.episode_number}`
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {episode.episode_number}. {episode.title}
                    </p>
                    {episode.description && (
                      <p className="text-neutral-400 text-sm line-clamp-2">{episode.description}</p>
                    )}
                  </div>
                  {episode.duration && (
                    <span className="text-neutral-500 text-sm shrink-0">{episode.duration} min</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}