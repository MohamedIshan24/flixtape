import apiClient from './client'

export const getCastMembers = () => apiClient.get('/cast-members/')

export const getCastMember = (castId) => apiClient.get(`/cast-members/${castId}`)

export const createCastMember = (data) => apiClient.post('/cast-members/', data)

export const deleteCastMember = (castId) => apiClient.delete(`/cast-members/${castId}`)