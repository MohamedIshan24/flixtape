import apiClient from './client'

export const getWatchHistory = (profileId) =>
  apiClient.get(`/profiles/${profileId}/watch-history/`)

export const upsertWatchHistory = (profileId, movieId, progressSeconds) =>
  apiClient.post(`/profiles/${profileId}/watch-history/`, {
    movie_id: movieId,
    progress_seconds: progressSeconds,
  })

export const deleteWatchHistory = (profileId, movieId) =>
  apiClient.delete(`/profiles/${profileId}/watch-history/${movieId}`)