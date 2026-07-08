import apiClient from './client'

export const getEpisodes = (seasonId) => apiClient.get(`/seasons/${seasonId}/episodes`)

export const createEpisode = (seasonId, data) =>
  apiClient.post(`/seasons/${seasonId}/episodes`, data)

export const updateEpisode = (episodeId, data) =>
  apiClient.patch(`/episodes/${episodeId}`, data)

export const deleteEpisode = (episodeId) =>
  apiClient.delete(`/episodes/${episodeId}`)