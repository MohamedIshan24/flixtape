import apiClient from './client'

export const getGenres = () => apiClient.get('/genres')