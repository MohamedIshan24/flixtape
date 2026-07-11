import { useState, useEffect, useCallback, useRef } from 'react'
import { getMovies, getRecommendations } from '../api/movies'
import { getGenres } from '../api/genres'
import { getWatchHistory } from '../api/watchHistory'
import { useProfiles } from '../context/ProfileContext'
import Navbar from '../components/Navbar'
import MovieRow from '../components/MovieRow'
import HeroSkeleton from '../components/skeletons/HeroSkeleton'
import MovieRowSkeleton from '../components/skeletons/MovieRowSkeleton'

export default function Browse() {
  const { activeProfile } = useProfiles()
  const [continueWatching, setContinueWatching] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [trending, setTrending] = useState([])
  const [featured, setFeatured] = useState([])
  const [series, setSeries] = useState([])
  const [genres, setGenres] = useState([])
  const [genreMovies, setGenreMovies] = useState({})
  const [searchResults, setSearchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const debounceRef = useRef(null)
  const isKids = !!activeProfile?.is_kids

  useEffect(() => {
    async function loadHome() {
      setIsLoading(true)
      try {
        const kidsFilter = isKids ? { kids_friendly: true } : {}

        const [historyRes, recommendationsRes, trendingRes, featuredRes, seriesRes, genresRes] = await Promise.all([
          getWatchHistory(activeProfile.id),
          getRecommendations(activeProfile.id),
          getMovies({ trending: true, type: 'movie', ...kidsFilter }),
          getMovies({ featured: true, type: 'movie', ...kidsFilter }),
          getMovies({ type: 'series', ...kidsFilter }),
          getGenres(),
        ])
        setContinueWatching(historyRes.data)
        setRecommendations(recommendationsRes.data)
        setTrending(trendingRes.data)
        setFeatured(featuredRes.data)
        setSeries(seriesRes.data)
        setGenres(genresRes.data)

        const genreResults = await Promise.all(
          genresRes.data.map((genre) => getMovies({ genre_id: genre.id, type: 'movie', ...kidsFilter }))
        )
        const genreMap = {}
        genresRes.data.forEach((genre, i) => {
          genreMap[genre.id] = genreResults[i].data
        })
        setGenreMovies(genreMap)
      } catch (err) {
        console.error('Failed to load browse data', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (activeProfile) loadHome()
  }, [activeProfile, isKids])

  const performSearch = useCallback(async (query) => {
    try {
      const kidsFilter = isKids ? { kids_friendly: true } : {}
      const res = await getMovies({ search: query, ...kidsFilter })
      setSearchResults(res.data)
    } catch (err) {
      console.error('Search failed', err)
    }
  }, [isKids])

  const handleSearch = useCallback((query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 400)
  }, [performSearch])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const heroMovie = featured[0] || series[0]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar onSearch={() => {}} />
        <HeroSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
      </div>
    )
  }

  const visibleGenres = genres.filter((genre) => (genreMovies[genre.id]?.length ?? 0) > 0)

  return (
    <div className="min-h-screen bg-black">
      <Navbar onSearch={handleSearch} />

      {searchResults !== null ? (
        <div className="pt-4">
          <MovieRow title={`Search results (${searchResults.length})`} movies={searchResults} />
          {searchResults.length === 0 && (
            <p className="text-neutral-400 px-4 md:px-8">No titles found.</p>
          )}
        </div>
      ) : (
        <>
          {heroMovie && (
            <div className="relative w-full h-[50vh] md:h-[70vh] mb-6">
              {heroMovie.banner_url ? (
                <img
                  src={heroMovie.banner_url}
                  alt={heroMovie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-900" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-10 left-4 md:left-8 max-w-lg">
                <h1 className="text-white text-3xl md:text-5xl font-bold mb-3">{heroMovie.title}</h1>
                <p className="text-neutral-200 text-sm md:text-base line-clamp-3">{heroMovie.description}</p>
              </div>
            </div>
          )}

          <MovieRow title="Continue Watching" movies={continueWatching} showProgress />
          <MovieRow title="Recommended for You" movies={recommendations} />
          <MovieRow title="TV Series" movies={series} />
          <MovieRow title="Trending Movies" movies={trending} />
          <MovieRow title="Featured Movies" movies={featured} />
          {visibleGenres.map((genre) => (
            <MovieRow key={genre.id} title={genre.name} movies={genreMovies[genre.id]} />
          ))}
        </>
      )}
    </div>
  )
}