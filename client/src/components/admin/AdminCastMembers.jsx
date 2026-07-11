import { useState, useEffect } from 'react'
import { getCastMembers, createCastMember, deleteCastMember } from '../../api/castMembers'

export default function AdminCastMembers() {
  const [castMembers, setCastMembers] = useState([])
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setIsLoading(true)
    try {
      const res = await getCastMembers()
      setCastMembers(res.data)
    } catch (err) {
      setError('Failed to load cast members')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await createCastMember({ name, photo_url: photoUrl || null })
      setCastMembers((prev) => [...prev, res.data])
      setName('')
      setPhotoUrl('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create cast member')
    }
  }

  async function handleDelete(castId) {
    if (!confirm('Delete this cast member? Movies using them will lose this credit.')) return
    try {
      await deleteCastMember(castId)
      setCastMembers((prev) => prev.filter((c) => c.id !== castId))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete cast member')
    }
  }

  return (
    <div>
      {error && <p className="text-orange-400 mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="flex gap-2 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-neutral-800 text-white rounded px-4 py-2 outline-none focus:ring-2 focus:ring-red-600"
          required
        />
        <input
          type="text"
          placeholder="Photo URL (optional)"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          className="bg-neutral-800 text-white rounded px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 flex-1 max-w-xs"
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium">
          Add Cast Member
        </button>
      </form>

      {isLoading ? (
        <p className="text-neutral-400">Loading...</p>
      ) : castMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-neutral-700 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-neutral-600 mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <p className="text-neutral-400 text-sm">No cast members yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {castMembers.map((cast) => (
            <div key={cast.id} className="bg-neutral-800 rounded p-3 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-neutral-700 overflow-hidden flex items-center justify-center">
                {cast.photo_url ? (
                  <img src={cast.photo_url} alt={cast.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{cast.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-sm text-center">{cast.name}</span>
              <button
                onClick={() => handleDelete(cast.id)}
                className="text-xs text-neutral-400 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}