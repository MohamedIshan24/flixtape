import { useState, useEffect, useCallback } from 'react'
import { getMovies } from '../api/movies'
import { getGenres } from '../api/genres'
import Navbar from '../components/Navbar'
import MovieRow from '../components/MovieRow'

export default function Browse() {
  const [trending, setTrending] = useState([])
  const [featured, setFeatured] = useState([])
  const [genres, setGenres] = useState([])
  const [genreMovies, setGenreMovies] = useState({})
  const [searchResults, setSearchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHome() {
      setIsLoading(true)
      try {
        const [trendingRes, featuredRes, genresRes] = await Promise.all([
          getMovies({ trending: true }),
          getMovies({ featured: true }),
          getGenres(),
        ])
        setTrending(trendingRes.data)
        setFeatured(featuredRes.data)
        setGenres(genresRes.data)

        const genreResults = await Promise.all(
          genresRes.data.map((genre) => getMovies({ genre_id: genre.id }))
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
    loadHome()
  }, [])

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    try {
      const res = await getMovies({ search: query })
      setSearchResults(res.data)
    } catch (err) {
      console.error('Search failed', err)
    }
  }, [])

  const heroMovie = featured[0]

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

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

          <MovieRow title="Trending Now" movies={trending} />
          <MovieRow title="Featured" movies={featured} />
          {genres.map((genre) => (
            <MovieRow key={genre.id} title={genre.name} movies={genreMovies[genre.id]} />
          ))}
        </>
      )}
    </div>
  )
}