import apiClient from './client'

export const getMyList = (profileId) =>
  apiClient.get(`/profiles/${profileId}/my-list/`)

export const addToMyList = (profileId, movieId) =>
  apiClient.post(`/profiles/${profileId}/my-list/`, { movie_id: movieId })

export const removeFromMyList = (profileId, movieId) =>
  apiClient.delete(`/profiles/${profileId}/my-list/${movieId}`)