import apiClient from './client'

export const upsertEpisodeRating = (profileId, episodeId, rating) =>
  apiClient.post(`/profiles/${profileId}/episode-ratings/`, { episode_id: episodeId, rating })

export const getEpisodeRating = (profileId, episodeId) =>
  apiClient.get(`/profiles/${profileId}/episode-ratings/${episodeId}`)

export const deleteEpisodeRating = (profileId, episodeId) =>
  apiClient.delete(`/profiles/${profileId}/episode-ratings/${episodeId}`)

export const getEpisodeRatingSummary = (episodeId) =>
  apiClient.get(`/episode-ratings/summary/episode/${episodeId}`)

export const getSeasonRatingSummary = (seasonId) =>
  apiClient.get(`/episode-ratings/summary/season/${seasonId}`)

export const getSeriesRatingSummary = (movieId) =>
  apiClient.get(`/episode-ratings/summary/series/${movieId}`)