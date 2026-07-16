import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { getMovie } from '../api/movies'
import { getMyList, addToMyList, removeFromMyList } from '../api/myList'
import { upsertRating, getRating } from '../api/ratings'
import { getSeasonRatingSummary, getSeriesRatingSummary } from '../api/episodeRatings'
import { useProfiles } from '../context/ProfileContext'
import StarRating from '../components/StarRating'
import BackgroundVideo from '../components/BackgroundVideo'
import Footer from '../components/Footer'

export default function MovieDetail() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const { activeProfile } = useProfiles()

  const [movie, setMovie] = useState(null)
  const [isInMyList, setIsInMyList] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSeasonId, setSelectedSeasonId] = useState(null)

  const [myRating, setMyRating] = useState(0)
  const [seriesSummary, setSeriesSummary] = useState(null)
  const [seasonSummaries, setSeasonSummaries] = useState({})

  const isSeries = movie?.type === 'series'

  const selectedSeason = useMemo(
    () => movie?.seasons?.find((s) => s.id === selectedSeasonId) || null,
    [movie, selectedSeasonId]
  )

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [movieRes, listRes] = await Promise.all([
          getMovie(movieId),
          getMyList(activeProfile.id),
        ])
        const movieData = movieRes.data
        setMovie(movieData)
        setIsInMyList(listRes.data.some((entry) => entry.movie.id === movieId))

        if (movieData.type === 'series') {
          try {
            const seriesSummaryRes = await getSeriesRatingSummary(movieId)
            setSeriesSummary(seriesSummaryRes.data)
          } catch (err) {
            console.error('Failed to load series rating summary', err)
          }

          if (movieData.seasons?.length > 0) {
            setSelectedSeasonId(movieData.seasons[0].id)

            const summaries = {}
            await Promise.all(
              movieData.seasons.map(async (season) => {
                try {
                  const res = await getSeasonRatingSummary(season.id)
                  summaries[season.id] = res.data
                } catch (err) {
                  console.error('Failed to load season summary', err)
                }
              })
            )
            setSeasonSummaries(summaries)
          }
        } else {
          try {
            const ratingRes = await getRating(activeProfile.id, movieId)
            setMyRating(ratingRes.data.rating)
          } catch (err) {
            if (err.response?.status !== 404) {
              console.error('Failed to load rating', err)
            }
            setMyRating(0)
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

  async function handleRate(star) {
    const previous = myRating
    setMyRating(star)
    try {
      const res = await upsertRating(activeProfile.id, movieId, star)
      setMovie((prev) => ({ ...prev, rating: res.data.rating ?? prev.rating }))
    } catch (err) {
      console.error('Failed to save rating', err)
      setMyRating(previous)
    }
  }

  function goToEpisode(episodeId) {
    navigate(`/movie/${movieId}/episode/${episodeId}`)
  }

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen bg-void text-reel flex items-center justify-center font-display">
        Loading...
      </div>
    )
  }

  const videoUrl = !isSeries ? movie.video_url : null
  const posterUrl = movie.thumbnail_url || movie.banner_url

  return (
    <div className="min-h-screen bg-void text-reel font-display relative">
      <BackgroundVideo />
      <div className="px-4 md:px-8 py-4">
        <button onClick={() => navigate(-1)} className="text-smoke hover:text-reel mb-4 transition">
          ← Back
        </button>
      </div>

      <div className="px-4 md:px-8">
        {!isSeries && (
          <div className="aspect-video bg-panel rounded overflow-hidden mb-6 relative border border-panel-line">
            {videoUrl ? (
              <ReactPlayer
                url={videoUrl}
                controls
                width="100%"
                height="100%"
              />
            ) : posterUrl ? (
              <div className="w-full h-full relative">
                <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center text-smoke text-sm bg-void/40">
                  No video available for this title yet
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-smoke">
                No video available for this title yet
              </div>
            )}
          </div>
        )}

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start gap-8 mb-6">
          {posterUrl && (
            <div className="w-40 md:w-48 shrink-0">
              <img src={posterUrl} alt={movie.title} className="w-full rounded shadow-lg border border-panel-line" />
            </div>
          )}

          <div className="flex-1 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{movie.title}</h1>
            <div className="flex items-center gap-3 text-smoke text-sm mb-4">
              {movie.release_year && <span>{movie.release_year}</span>}
              {movie.duration && <span>{movie.duration} min</span>}
              {!isSeries && movie.rating > 0 && (
                <span className="text-flix-red font-semibold">
                  ★ {movie.rating.toFixed(1)}
                  <span className="text-smoke font-normal">
                    {movie.rating_count > 0 && ` (${movie.rating_count} rating${movie.rating_count === 1 ? '' : 's'})`}
                  </span>
                </span>
              )}
              {isSeries && seriesSummary && seriesSummary.average_rating > 0 && (
                <span className="text-flix-red font-semibold">★ {seriesSummary.average_rating.toFixed(1)}</span>
              )}
            </div>
            <p className="text-smoke mb-6">{movie.description}</p>

            {movie.director && (
              <p className="text-smoke text-sm mb-2">
                <span className="text-smoke/60">Director: </span>
                {movie.director}
              </p>
            )}

            {movie.cast_members?.length > 0 && (
              <p className="text-smoke text-sm mb-6">
                <span className="text-smoke/60">Cast: </span>
                {movie.cast_members.map((c, i) => (
                  <span key={c.id}>
                    <span
                      onClick={() => navigate(`/actor/${c.id}`)}
                      className="hover:text-flix-red hover:underline cursor-pointer transition"
                    >
                      {c.name}
                    </span>
                    {i < movie.cast_members.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={handleToggleMyList}
                className={`px-6 py-3 rounded font-bold transition ${
                  isInMyList
                    ? 'bg-panel border border-panel-line text-reel hover:bg-void-soft'
                    : 'bg-flix-red text-reel hover:bg-flix-red-dim'
                }`}
              >
                {isInMyList ? '✓ In My List' : '+ Add to My List'}
              </button>

              {!isSeries && (
                <div>
                  <p className="text-smoke/70 text-xs mb-1">
                    {myRating > 0 ? 'Your rating' : 'Rate this'}
                  </p>
                  <StarRating value={myRating} onChange={handleRate} size="text-xl" />
                </div>
              )}
            </div>
          </div>
        </div>

        {isSeries && movie.seasons?.length > 0 && (
          <div className="max-w-3xl mx-auto mt-10 mb-10">
            <h2 className="text-xl font-extrabold mb-4">Episodes</h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.seasons.map((season) => {
                const summary = seasonSummaries[season.id]
                const isActive = season.id === selectedSeasonId
                return (
                  <button
                    key={season.id}
                    onClick={() => setSelectedSeasonId(season.id)}
                    className={`px-4 py-3 rounded flex flex-col items-center min-w-22.5 transition border ${
                      isActive
                        ? 'bg-flix-red text-reel border-flix-red'
                        : 'bg-panel text-smoke border-panel-line hover:bg-void-soft'
                    }`}
                  >
                    <span className="font-semibold text-sm">
                      Season {season.season_number}
                    </span>
                    {summary && summary.average_rating > 0 && (
                      <span className="text-xs mt-1 opacity-90">★ {summary.average_rating.toFixed(1)}</span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="space-y-2">
              {selectedSeason?.episodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => goToEpisode(episode.id)}
                  className="flex items-center gap-4 p-3 rounded cursor-pointer transition bg-panel border border-panel-line hover:bg-void-soft hover:border-flix-red"
                >
                  <div className="w-24 h-14 shrink-0 bg-void-soft rounded overflow-hidden relative flex items-center justify-center text-smoke text-xs group">
                    {episode.thumbnail_url ? (
                      <img
                        src={episode.thumbnail_url}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      `E${episode.episode_number}`
                    )}
                    {episode.video_url && (
                      <div className="absolute inset-0 bg-void/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-reel">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {episode.episode_number}. {episode.title}
                    </p>
                    {episode.description && (
                      <p className="text-smoke text-sm line-clamp-2">{episode.description}</p>
                    )}
                  </div>
                  {episode.duration && (
                    <span className="text-smoke text-sm shrink-0">{episode.duration} min</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}