import { useState, useEffect } from 'react'
import { getMovies, createMovie, updateMovie, deleteMovie } from '../../api/movies'
import { getGenres } from '../../api/genres'
import { getCastMembers } from '../../api/castMembers'
import SeasonEpisodeManager from './SeasonEpisodeManager'

const emptyForm = {
  title: '',
  description: '',
  release_year: '',
  duration: '',
  video_url: '',
  trailer_url: '',
  thumbnail_url: '',
  banner_url: '',
  director: '',
  type: 'movie',
  is_trending: false,
  is_featured: false,
  genre_ids: [],
  cast_member_ids: [],
}

export default function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [castMembers, setCastMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingMovieSeasons, setEditingMovieSeasons] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setIsLoading(true)
    try {
      const [moviesRes, genresRes, castRes] = await Promise.all([
        getMovies(),
        getGenres(),
        getCastMembers(),
      ])
      setMovies(moviesRes.data)
      setGenres(genresRes.data)
      setCastMembers(castRes.data)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateForm() {
    setForm(emptyForm)
    setEditingId(null)
    setEditingMovieSeasons([])
    setIsFormOpen(true)
  }

  function openEditForm(movie) {
    setForm({
      title: movie.title,
      description: movie.description || '',
      release_year: movie.release_year || '',
      duration: movie.duration || '',
      video_url: movie.video_url || '',
      trailer_url: movie.trailer_url || '',
      thumbnail_url: movie.thumbnail_url || '',
      banner_url: movie.banner_url || '',
      director: movie.director || '',
      type: movie.type,
      is_trending: movie.is_trending,
      is_featured: movie.is_featured,
      genre_ids: movie.genres.map((g) => g.id),
      cast_member_ids: movie.cast_members.map((c) => c.id),
    })
    setEditingId(movie.id)
    setEditingMovieSeasons(movie.seasons || [])
    setIsFormOpen(true)
  }

  function toggleGenre(genreId) {
    setForm((prev) => ({
      ...prev,
      genre_ids: prev.genre_ids.includes(genreId)
        ? prev.genre_ids.filter((id) => id !== genreId)
        : [...prev.genre_ids, genreId],
    }))
  }

  function toggleCast(castId) {
    setForm((prev) => ({
      ...prev,
      cast_member_ids: prev.cast_member_ids.includes(castId)
        ? prev.cast_member_ids.filter((id) => id !== castId)
        : [...prev.cast_member_ids, castId],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      ...form,
      release_year: form.release_year ? Number(form.release_year) : null,
      duration: form.duration ? Number(form.duration) : null,
      description: form.description || null,
      video_url: form.video_url || null,
      trailer_url: form.trailer_url || null,
      thumbnail_url: form.thumbnail_url || null,
      banner_url: form.banner_url || null,
      director: form.director || null,
    }

    try {
      if (editingId) {
        const res = await updateMovie(editingId, payload)
        setMovies((prev) => prev.map((m) => (m.id === editingId ? res.data : m)))
      } else {
        const res = await createMovie(payload)
        setMovies((prev) => [...prev, res.data])
      }
      setIsFormOpen(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save movie')
    }
  }

  async function handleDelete(movieId) {
    if (!confirm('Delete this movie permanently?')) return
    try {
      await deleteMovie(movieId)
      setMovies((prev) => prev.filter((m) => m.id !== movieId))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete movie')
    }
  }

  return (
    <div>
      {error && <p className="text-orange-400 mb-4">{error}</p>}

      <button
        onClick={openCreateForm}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium mb-6"
      >
        + Add Movie
      </button>

      {isLoading ? (
        <p className="text-neutral-400">Loading...</p>
      ) : (
        <div className="space-y-2">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex items-center justify-between bg-neutral-800 rounded px-4 py-3"
            >
              <div>
                <p className="font-medium">{movie.title}</p>
                <p className="text-xs text-neutral-400">
                  {movie.release_year} · {movie.type}
                  {movie.is_trending && ' · Trending'}
                  {movie.is_featured && ' · Featured'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => openEditForm(movie)}
                  className="text-neutral-300 hover:text-white text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(movie.id)}
                  className="text-neutral-300 hover:text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center px-4 overflow-y-auto py-8 z-20">          
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 p-6 rounded-md w-full max-w-2xl space-y-4"
          >
            <h2 className="text-xl font-bold">{editingId ? 'Edit Movie' : 'Add Movie'}</h2>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 col-span-2 outline-none focus:ring-2 focus:ring-red-600"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 col-span-2 outline-none focus:ring-2 focus:ring-red-600"
                rows={3}
              />
              <input
                type="number"
                placeholder="Release year"
                value={form.release_year}
                onChange={(e) => setForm({ ...form, release_year: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
              />
              <input
                type="text"
                placeholder="Director"
                value={form.director}
                onChange={(e) => setForm({ ...form, director: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
              </select>
              <input
                type="text"
                placeholder="Video URL"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 col-span-2 outline-none focus:ring-2 focus:ring-red-600"
              />
              <input
                type="text"
                placeholder="Trailer URL"
                value={form.trailer_url}
                onChange={(e) => setForm({ ...form, trailer_url: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 col-span-2 outline-none focus:ring-2 focus:ring-red-600"
              />
              <input
                type="text"
                placeholder="Thumbnail URL"
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
              />
              <input
                type="text"
                placeholder="Banner URL"
                value={form.banner_url}
                onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
                className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_trending}
                  onChange={(e) => setForm({ ...form, is_trending: e.target.checked })}
                />
                Trending
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                Featured
              </label>
            </div>

            <div>
              <p className="text-sm text-neutral-400 mb-2">Genres</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    type="button"
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      form.genre_ids.includes(genre.id)
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-neutral-400 mb-2">Cast</p>
              <div className="flex flex-wrap gap-2">
                {castMembers.map((cast) => (
                  <button
                    type="button"
                    key={cast.id}
                    onClick={() => toggleCast(cast.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      form.cast_member_ids.includes(cast.id)
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {cast.name}
                  </button>
                ))}
              </div>
            </div>

            {editingId && form.type === 'series' && (
              <SeasonEpisodeManager
                movieId={editingId}
                seasons={editingMovieSeasons}
                onSeasonsChange={setEditingMovieSeasons}
              />
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded px-4 py-3"
              >
                {editingId ? 'Save Changes' : 'Create Movie'}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 border border-neutral-500 text-neutral-300 rounded px-4 py-3 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}