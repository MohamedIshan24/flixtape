import apiClient from './client'

export const getGenres = () => apiClient.get('/genres/')

export const createGenre = (data) => apiClient.post('/genres/', data)

export const deleteGenre = (genreId) => apiClient.delete(`/genres/${genreId}`)