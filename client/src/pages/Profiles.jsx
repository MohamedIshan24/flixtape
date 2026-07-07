import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '../context/ProfileContext'
import { createProfile as createProfileApi, deleteProfile as deleteProfileApi } from '../api/profiles'
import { useAuth } from '../context/AuthContext'

export default function Profiles() {
  const { profiles, isLoading, selectProfile, addProfile, removeProfile } = useProfiles()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSelect(profile) {
    if (isManaging) return
    selectProfile(profile)
    navigate('/browse')
  }

  async function handleAddProfile(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await createProfileApi({ name, is_kids: false })
      addProfile(res.data)
      setName('')
      setIsAdding(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create profile')
    }
  }

  async function handleDelete(profileId, e) {
    e.stopPropagation()
    try {
      await deleteProfileApi(profileId)
      removeProfile(profileId)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete profile')
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-10">Who's watching?</h1>

      {error && <p className="text-orange-400 mb-4">{error}</p>}

      <div className="flex flex-wrap justify-center gap-6 mb-10 max-w-2xl">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => handleSelect(profile)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded overflow-hidden bg-neutral-700 flex items-center justify-center text-3xl font-bold group-hover:ring-4 ring-white transition">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
              {isManaging && (
                <button
                  onClick={(e) => handleDelete(profile.id, e)}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center text-red-500 font-bold"
                >
                  Remove
                </button>
              )}
            </div>
            <span className="text-neutral-300 group-hover:text-white">{profile.name}</span>
          </div>
        ))}

        {profiles.length < 5 && (
          <div
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded bg-neutral-800 flex items-center justify-center text-5xl text-neutral-500 group-hover:text-white group-hover:ring-4 ring-white transition">
              +
            </div>
            <span className="text-neutral-400 group-hover:text-white">Add Profile</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsManaging((prev) => !prev)}
          className="border border-neutral-500 text-neutral-300 px-6 py-2 rounded hover:border-white hover:text-white transition"
        >
          {isManaging ? 'Done' : 'Manage Profiles'}
        </button>
        <button
          onClick={logout}
          className="text-neutral-400 hover:text-white transition"
        >
          Log out
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4">
          <form onSubmit={handleAddProfile} className="bg-neutral-900 p-8 rounded-md w-full max-w-sm">
            <h2 className="text-white text-xl font-bold mb-4">Add Profile</h2>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-800 text-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-red-600 mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded px-4 py-3"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
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