import { useState, useEffect } from 'react'
import { createSeason, deleteSeason } from '../../api/seasons'
import { createEpisode, updateEpisode, deleteEpisode } from '../../api/episodes'

const emptyEpisodeForm = {
  episode_number: '',
  title: '',
  description: '',
  duration: '',
  video_url: '',
  thumbnail_url: '',
}

export default function SeasonEpisodeManager({ movieId, seasons, onSeasonsChange }) {
  const [newSeasonNumber, setNewSeasonNumber] = useState('')
  const [newSeasonTitle, setNewSeasonTitle] = useState('')
  const [expandedSeasonId, setExpandedSeasonId] = useState(null)
  const [episodeForm, setEpisodeForm] = useState(emptyEpisodeForm)
  const [editingEpisodeId, setEditingEpisodeId] = useState(null)
  const [error, setError] = useState('')

  async function handleAddSeason(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await createSeason(movieId, {
        season_number: Number(newSeasonNumber),
        title: newSeasonTitle || null,
      })
      onSeasonsChange([...seasons, { ...res.data, episodes: [] }])
      setNewSeasonNumber('')
      setNewSeasonTitle('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add season')
    }
  }

  async function handleDeleteSeason(seasonId) {
    if (!confirm('Delete this season and all its episodes?')) return
    try {
      await deleteSeason(seasonId)
      onSeasonsChange(seasons.filter((s) => s.id !== seasonId))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete season')
    }
  }

  function openAddEpisode(seasonId) {
    setExpandedSeasonId(seasonId)
    setEditingEpisodeId(null)
    setEpisodeForm(emptyEpisodeForm)
  }

  function openEditEpisode(seasonId, episode) {
    setExpandedSeasonId(seasonId)
    setEditingEpisodeId(episode.id)
    setEpisodeForm({
      episode_number: episode.episode_number,
      title: episode.title,
      description: episode.description || '',
      duration: episode.duration || '',
      video_url: episode.video_url || '',
      thumbnail_url: episode.thumbnail_url || '',
    })
  }

  async function handleSaveEpisode(seasonId) {
    setError('')
    const payload = {
      episode_number: Number(episodeForm.episode_number),
      title: episodeForm.title,
      description: episodeForm.description || null,
      duration: episodeForm.duration ? Number(episodeForm.duration) : null,
      video_url: episodeForm.video_url || null,
      thumbnail_url: episodeForm.thumbnail_url || null,
    }

    try {
      if (editingEpisodeId) {
        const res = await updateEpisode(editingEpisodeId, payload)
        onSeasonsChange(
          seasons.map((s) =>
            s.id === seasonId
              ? { ...s, episodes: s.episodes.map((e) => (e.id === editingEpisodeId ? res.data : e)) }
              : s
          )
        )
      } else {
        const res = await createEpisode(seasonId, payload)
        onSeasonsChange(
          seasons.map((s) => (s.id === seasonId ? { ...s, episodes: [...s.episodes, res.data] } : s))
        )
      }
      setEpisodeForm(emptyEpisodeForm)
      setEditingEpisodeId(null)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save episode')
    }
  }

  async function handleDeleteEpisode(seasonId, episodeId) {
    if (!confirm('Delete this episode?')) return
    try {
      await deleteEpisode(episodeId)
      onSeasonsChange(
        seasons.map((s) =>
          s.id === seasonId ? { ...s, episodes: s.episodes.filter((e) => e.id !== episodeId) } : s
        )
      )
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete episode')
    }
  }

  return (
    <div className="border-t border-neutral-700 pt-4 mt-2">
      <h3 className="text-lg font-semibold mb-3">Seasons & Episodes</h3>

      {error && <p className="text-orange-400 mb-3 text-sm">{error}</p>}

      <form onSubmit={handleAddSeason} className="flex gap-2 mb-4 flex-wrap">
        <input
          type="number"
          placeholder="Season #"
          value={newSeasonNumber}
          onChange={(e) => setNewSeasonNumber(e.target.value)}
          className="bg-neutral-800 rounded px-3 py-2 w-28 outline-none focus:ring-2 focus:ring-red-600"
          required
        />
        <input
          type="text"
          placeholder="Season title (optional)"
          value={newSeasonTitle}
          onChange={(e) => setNewSeasonTitle(e.target.value)}
          className="bg-neutral-800 rounded px-3 py-2 flex-1 outline-none focus:ring-2 focus:ring-red-600"
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium">
          Add Season
        </button>
      </form>

      <div className="space-y-3">
        {seasons.map((season) => (
          <div key={season.id} className="bg-neutral-800 rounded p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Season {season.season_number}
                {season.title ? ` — ${season.title}` : ''}
                <span className="text-neutral-400 text-sm ml-2">
                  ({season.episodes.length} episode{season.episodes.length !== 1 ? 's' : ''})
                </span>
              </span>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => openAddEpisode(season.id)}
                  className="text-neutral-300 hover:text-white"
                >
                  + Episode
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSeason(season.id)}
                  className="text-neutral-300 hover:text-red-500"
                >
                  Delete Season
                </button>
              </div>
            </div>

            {season.episodes.length > 0 && (
              <div className="mt-3 space-y-1">
                {season.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between bg-neutral-900 rounded px-3 py-2 text-sm"
                  >
                    <span>
                      E{ep.episode_number}: {ep.title}
                    </span>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => openEditEpisode(season.id, ep)}
                        className="text-neutral-300 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEpisode(season.id, ep.id)}
                        className="text-neutral-300 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {expandedSeasonId === season.id && (
              <div className="mt-3 bg-neutral-900 rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Episode #"
                    value={episodeForm.episode_number}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })}
                    className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={episodeForm.title}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                    className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <textarea
                    placeholder="Description"
                    value={episodeForm.description}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                    className="bg-neutral-800 rounded px-3 py-2 col-span-2 outline-none focus:ring-2 focus:ring-red-600"
                    rows={2}
                  />
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={episodeForm.duration}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, duration: e.target.value })}
                    className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Video URL"
                    value={episodeForm.video_url}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, video_url: e.target.value })}
                    className="bg-neutral-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Thumbnail URL"
                    value={episodeForm.thumbnail_url}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, thumbnail_url: e.target.value })}
                    className="bg-neutral-800 rounded px-3 py-2 col-span-2 outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEpisode(season.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium text-sm"
                  >
                    {editingEpisodeId ? 'Save Episode' : 'Create Episode'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedSeasonId(null)}
                    className="border border-neutral-600 px-4 py-2 rounded text-sm text-neutral-300 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}