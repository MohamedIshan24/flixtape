import { useState } from 'react'
import AdminMovies from '../components/admin/AdminMovies'
import AdminGenres from '../components/admin/AdminGenres'
import AdminCastMembers from '../components/admin/AdminCastMembers'
import { Link } from 'react-router-dom'

const TABS = [
  { key: 'movies', label: 'Movies' },
  { key: 'genres', label: 'Genres' },
  { key: 'cast', label: 'Cast Members' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('movies')

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-neutral-800">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link to="/browse" className="text-neutral-400 hover:text-white text-sm">
          ← Back to Browse
        </Link>
      </div>

      <div className="flex gap-2 px-4 md:px-8 pt-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t font-medium transition ${
              activeTab === tab.key
                ? 'bg-neutral-900 text-white border-b-2 border-red-600'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-neutral-900 px-4 md:px-8 py-6">
        {activeTab === 'movies' && <AdminMovies />}
        {activeTab === 'genres' && <AdminGenres />}
        {activeTab === 'cast' && <AdminCastMembers />}
      </div>
    </div>
  )
}