import apiClient from './client'

export const getMovies = (params = {}) => apiClient.get('/movies/', { params })

export const getMovie = (movieId) => apiClient.get(`/movies/${movieId}`)

export const createMovie = (data) => apiClient.post('/movies/', data)

export const updateMovie = (movieId, data) => apiClient.patch(`/movies/${movieId}`, data)

export const deleteMovie = (movieId) => apiClient.delete(`/movies/${movieId}`)

export const getRecommendations = (profileId) =>
  apiClient.get(`/movies/recommendations/${profileId}`)