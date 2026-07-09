import apiClient from './client'

export const upsertRating = (profileId, movieId, rating) =>
  apiClient.post(`/profiles/${profileId}/ratings/`, { movie_id: movieId, rating })

export const getRating = (profileId, movieId) =>
  apiClient.get(`/profiles/${profileId}/ratings/${movieId}`)

export const deleteRating = (profileId, movieId) =>
  apiClient.delete(`/profiles/${profileId}/ratings/${movieId}`)