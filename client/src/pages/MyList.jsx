import { useState, useEffect } from 'react'
import { getMyList, removeFromMyList } from '../api/myList'
import { useProfiles } from '../context/ProfileContext'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function MyList() {
  const { activeProfile } = useProfiles()
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const res = await getMyList(activeProfile.id)
        setList(res.data)
      } catch (err) {
        console.error('Failed to load My List', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (activeProfile) load()
  }, [activeProfile])

  async function handleRemove(movieId, e) {
    e.stopPropagation()
    try {
      await removeFromMyList(activeProfile.id, movieId)
      setList((prev) => prev.filter((entry) => entry.movie.id !== movieId))
    } catch (err) {
      console.error('Failed to remove from My List', err)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar onSearch={() => {}} />

      <div className="px-4 md:px-8 py-6">
        <h1 className="text-white text-2xl font-bold mb-6">My List</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-video bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-neutral-800 rounded mt-2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-neutral-600 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <h2 className="text-white text-lg font-semibold mb-2">Your list is empty</h2>
            <p className="text-neutral-400 text-sm mb-6 max-w-sm">
              Save movies and shows you want to watch later by tapping "Add to My List" on any title.
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold"
            >
              Browse Titles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {list.map((entry) => (
              <div
                key={entry.movie.id}
                onClick={() => navigate(`/movie/${entry.movie.id}`)}
                className="cursor-pointer group"
              >
                <div className="relative aspect-video bg-neutral-800 rounded overflow-hidden group-hover:ring-2 ring-white transition">
                  {entry.movie.thumbnail_url ? (
                    <img
                      src={entry.movie.thumbnail_url}
                      alt={entry.movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm text-center px-2">
                      {entry.movie.title}
                    </div>
                  )}
                  <button
                    onClick={(e) => handleRemove(entry.movie.id, e)}
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-neutral-300 text-sm mt-1 truncate group-hover:text-white">
                  {entry.movie.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}