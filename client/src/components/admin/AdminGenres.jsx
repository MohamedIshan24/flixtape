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
      {error && <p className="text-orange-400 mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New genre name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-neutral-800 text-white rounded px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 flex-1 max-w-xs"
          required
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium">
          Add Genre
        </button>
      </form>

      {isLoading ? (
        <p className="text-neutral-400">Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="flex items-center gap-2 bg-neutral-800 rounded-full pl-4 pr-2 py-1"
            >
              <span>{genre.name}</span>
              <button
                onclick={() => handleDelete(genre.id)}
                className="text-neutral-400 hover:text-red-500 text-sm"
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