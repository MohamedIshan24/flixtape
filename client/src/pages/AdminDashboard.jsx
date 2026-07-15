import { useState } from 'react'
import AdminMovies from '../components/admin/AdminMovies'
import AdminGenres from '../components/admin/AdminGenres'
import AdminCastMembers from '../components/admin/AdminCastMembers'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import { Link } from 'react-router-dom'

const TABS = [
  { key: 'movies', label: 'Movies' },
  { key: 'genres', label: 'Genres' },
  { key: 'cast', label: 'Cast Members' },
  { key: 'analytics', label: 'Analytics' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('movies')

  return (
    <div className="min-h-screen bg-void text-reel font-display">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-panel-line">
        <h1 className="text-2xl font-extrabold">Manage Content</h1>
        <Link to="/browse" className="text-smoke hover:text-reel text-sm transition">
          ← Back to Browse
        </Link>
      </div>

      <div className="flex gap-2 px-4 md:px-8 pt-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t font-semibold transition ${
              activeTab === tab.key
                ? 'bg-panel text-reel border-b-2 border-flix-red'
                : 'text-smoke hover:text-reel'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-panel px-4 md:px-8 py-6">
        {activeTab === 'movies' && <AdminMovies />}
        {activeTab === 'genres' && <AdminGenres />}
        {activeTab === 'cast' && <AdminCastMembers />}
        {activeTab === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  )
}