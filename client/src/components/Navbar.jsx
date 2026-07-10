import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProfiles } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onSearch }) {
  const { activeProfile, clearActiveProfile } = useProfiles()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearchChange(e) {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  function handleSwitchProfile() {
    clearActiveProfile()
    navigate('/profiles')
  }

  return (
    <div className="flex items-center justify-between px-4 md:px-8 py-4 sticky top-0 bg-linear-to-b from-black to-transparent z-10">
      <div className="flex items-center gap-6">
        <Link to="/browse" className="text-red-600 text-2xl font-bold tracking-wide">
          FLIXTAPE
        </Link>
        <Link to="/my-list" className="text-neutral-300 hover:text-white text-sm">
          My List
        </Link>
        <Link to="/account" className="text-neutral-300 hover:text-white text-sm">
          Settings
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="text-neutral-300 hover:text-white text-sm">
            Manage Content
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search titles..."
          value={query}
          onChange={handleSearchChange}
          className="bg-black/70 border border-neutral-600 text-white text-sm rounded px-3 py-2 w-40 md:w-64 outline-none focus:border-white transition"
        />
        {user?.role === 'admin' && (
          <span className="text-[10px] uppercase tracking-wide bg-red-600 text-white px-2 py-0.5 rounded font-semibold">
            Admin
          </span>
        )}
        <div className="flex flex-col items-center gap-1">
          <div
            onClick={handleSwitchProfile}
            className="w-8 h-8 rounded bg-neutral-700 flex items-center justify-center text-white text-sm cursor-pointer hover:ring-2 ring-white"
            title={`Switch profile (currently ${activeProfile?.name})`}
          >
            {activeProfile?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-neutral-400 text-[10px]">{activeProfile?.name}</span>
        </div>
      </div>
    </div>
  )
}