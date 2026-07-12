import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useProfiles } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const NAV_LINKS = [
  {
    to: '/my-list',
    label: 'My List',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    ),
  },
  {
    to: '/account',
    label: 'Settings',
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </>
    ),
  },
]

export default function Navbar({ onSearch }) {
  const { activeProfile, clearActiveProfile } = useProfiles()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

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

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                  {link.icon}
                </svg>
                {link.label}
              </Link>
            )
          })}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition ${
                location.pathname === '/admin'
                  ? 'text-white bg-white/10'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              Manage Content
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search titles..."
          value={query}
          onChange={handleSearchChange}
          className="bg-black/70 border border-neutral-600 text-white text-sm rounded px-3 py-2 w-40 md:w-64 outline-none focus:border-white transition"
        />
        <NotificationBell />
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