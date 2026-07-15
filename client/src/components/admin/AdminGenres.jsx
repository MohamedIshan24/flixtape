import { useState, useEffect } from 'react'
import { getGenres, createGenre, deleteGenre } from '../../api/genres'

export default function AdminGenres() {
  const [genres, setGenres] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setIsLoading(true)
    try {
      const res = await getGenres()
      setGenres(res.data)
    } catch (err) {
      setError('Failed to load genres')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await createGenre({ name })
      setGenres((prev) => [...prev, res.data])
      setName('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create genre')
    }
  }

  async function handleDelete(genreId) {
    if (!confirm('Delete this genre? Movies using it will lose this tag.')) return
    try {
      await deleteGenre(genreId)
      setGenres((prev) => prev.filter((g) => g.id !== genreId))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete genre')
    }
  }

  return (
    <div>
      {error && <p className="text-flix-red mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New genre name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-void border border-panel-line text-reel placeholder-smoke rounded px-4 py-2 outline-none focus:border-flix-red focus:ring-1 focus:ring-flix-red flex-1 max-w-xs transition"
          required
        />
        <button type="submit" className="bg-flix-red hover:bg-flix-red-dim text-reel px-4 py-2 rounded font-semibold transition">
          Add Genre
        </button>
      </form>

      {isLoading ? (
        <p className="text-smoke">Loading...</p>
      ) : genres.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-panel-line rounded">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-panel-line mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          </svg>
          <p className="text-smoke text-sm">No genres yet. Add your first genre above.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="flex items-center gap-2 bg-void-soft border border-panel-line rounded-full pl-4 pr-2 py-1"
            >
              <span>{genre.name}</span>
              <button
                onClick={() => handleDelete(genre.id)}
                className="text-smoke hover:text-flix-red text-sm transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}