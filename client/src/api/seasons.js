import apiClient from './client'

export const getSeasons = (movieId) => apiClient.get(`/movies/${movieId}/seasons`)

export const createSeason = (movieId, data) =>
  apiClient.post(`/movies/${movieId}/seasons`, data)

export const updateSeason = (seasonId, data) =>
  apiClient.patch(`/seasons/${seasonId}`, data)

export const deleteSeason = (seasonId) =>
  apiClient.delete(`/seasons/${seasonId}`)