import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { getMovie } from '../api/movies'
import { upsertWatchHistory, getWatchHistory } from '../api/watchHistory'
import {
  upsertEpisodeRating,
  getEpisodeRating,
  getEpisodeRatingSummary,
} from '../api/episodeRatings'
import { useProfiles } from '../context/ProfileContext'
import StarRating from '../components/StarRating'
import BackgroundVideo from '../components/BackgroundVideo'
import Footer from '../components/Footer'

export default function EpisodeDetail() {
  const { movieId, episodeId } = useParams()
  const navigate = useNavigate()
  const { activeProfile } = useProfiles()

  const [movie, setMovie] = useState(null)
  const [season, setSeason] = useState(null)
  const [episode, setEpisode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startTime, setStartTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [myEpisodeRating, setMyEpisodeRating] = useState(0)
  const [episodeSummary, setEpisodeSummary] = useState(null)

  const lastSavedRef = useRef(0)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [movieRes, historyRes] = await Promise.all([
          getMovie(movieId),
          getWatchHistory(activeProfile.id),
        ])
        const movieData = movieRes.data
        setMovie(movieData)

        const foundSeason = movieData.seasons?.find((s) =>
          s.episodes.some((e) => e.id === episodeId)
        )
        const foundEpisode = foundSeason?.episodes.find((e) => e.id === episodeId)
        setSeason(foundSeason || null)
        setEpisode(foundEpisode || null)

        const historyEntry = historyRes.data.find((entry) => entry.episode_id === episodeId)
        if (historyEntry) {
          setStartTime(historyEntry.progress_seconds)
        } else {
          setStartTime(0)
        }
        lastSavedRef.current = 0

        try {
          const summaryRes = await getEpisodeRatingSummary(episodeId)
          setEpisodeSummary(summaryRes.data)
        } catch (err) {
          console.error('Failed to load episode rating summary', err)
        }

        try {
          const myRes = await getEpisodeRating(activeProfile.id, episodeId)
          setMyEpisodeRating(myRes.data.rating)
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error('Failed to load your episode rating', err)
          }
          setMyEpisodeRating(0)
        }
      } catch (err) {
        console.error('Failed to load episode', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (activeProfile) load()
  }, [movieId, episodeId, activeProfile])

  const handleProgress = useCallback(
    (state) => {
      const seconds = Math.floor(state.playedSeconds)
      if (Math.abs(seconds - lastSavedRef.current) >= 10) {
        lastSavedRef.current = seconds
        upsertWatchHistory(activeProfile.id, movieId, seconds, episodeId).catch((err) =>
          console.error('Failed to save watch progress', err)
        )
      }
    },
    [activeProfile, movieId, episodeId]
  )

  async function handleRateEpisode(star) {
    const previous = myEpisodeRating
    setMyEpisodeRating(star)
    try {
      await upsertEpisodeRating(activeProfile.id, episodeId, star)
      const summaryRes = await getEpisodeRatingSummary(episodeId)
      setEpisodeSummary(summaryRes.data)
    } catch (err) {
      console.error('Failed to save episode rating', err)
      setMyEpisodeRating(previous)
    }
  }

  function goToEpisode(targetEpisodeId) {
    navigate(`/movie/${movieId}/episode/${targetEpisodeId}`)
  }

  if (isLoading || !movie || !episode || !season) {
    return (
      <div className="min-h-screen bg-void text-reel flex items-center justify-center font-display">
        Loading...
      </div>
    )
  }

  const episodeIndex = season.episodes.findIndex((e) => e.id === episodeId)
  const prevEpisode = episodeIndex > 0 ? season.episodes[episodeIndex - 1] : null
  const nextEpisode = episodeIndex < season.episodes.length - 1 ? season.episodes[episodeIndex + 1] : null

  return (
    <div className="min-h-screen bg-void text-reel font-display relative">
      <BackgroundVideo />
      <div className="px-4 md:px-8 py-4">
        <button onClick={() => navigate(-1)} className="text-smoke hover:text-reel transition">
          ← Back to {movie.title}
        </button>
      </div>

      <div className="px-4 md:px-8">
        <div className="aspect-video bg-panel rounded overflow-hidden mb-6 relative border border-panel-line">
          {episode.video_url ? (
            <ReactPlayer
              key={episode.id}
              url={episode.video_url}
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
          ) : episode.thumbnail_url ? (
            <div className="w-full h-full relative">
              <img src={episode.thumbnail_url} alt={episode.title} className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center text-smoke text-sm bg-void/40">
                No video available for this episode yet
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-smoke">
              No video available for this episode yet
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <p className="text-smoke text-sm mb-1">
            {movie.title} · Season {season.season_number}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            {episode.episode_number}. {episode.title}
          </h1>
          <div className="flex items-center gap-3 text-smoke text-sm mb-4">
            {episode.duration && <span>{episode.duration} min</span>}
          </div>
          {episode.description && (
            <p className="text-smoke mb-6">{episode.description}</p>
          )}

          <div className="flex items-center gap-6">
            <div>
              <p className="text-smoke/70 text-xs mb-1">
                {myEpisodeRating > 0 ? 'Your rating' : 'Rate this episode'}
              </p>
              <StarRating value={myEpisodeRating} onChange={handleRateEpisode} size="text-xl" />
            </div>
            {episodeSummary && (
              <span className="text-smoke text-sm">
                {episodeSummary.rating_count} rating{episodeSummary.rating_count === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto flex justify-between pb-10 border-t border-panel-line pt-6">
          {prevEpisode ? (
            <button
              onClick={() => goToEpisode(prevEpisode.id)}
              className="text-smoke hover:text-flix-red text-sm transition"
            >
              ← Previous Episode
            </button>
          ) : <span />}
          {nextEpisode ? (
            <button
              onClick={() => goToEpisode(nextEpisode.id)}
              className="text-smoke hover:text-flix-red text-sm transition"
            >
              Next Episode →
            </button>
          ) : <span />}
        </div>
      </div>
      <Footer />
    </div>
  )
}