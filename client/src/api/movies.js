import apiClient from './client'

export const getMovies = (params = {}) => apiClient.get('/movies/', { params })

export const getMovie = (movieId) => apiClient.get(`/movies/${movieId}`)