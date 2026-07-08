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