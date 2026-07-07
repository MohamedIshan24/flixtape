import apiClient from './client'

export const getProfiles = () => apiClient.get('/profiles')

export const createProfile = (data) => apiClient.post('/profiles', data)

export const updateProfile = (profileId, data) =>
  apiClient.patch(`/profiles/${profileId}`, data)

export const deleteProfile = (profileId) =>
  apiClient.delete(`/profiles/${profileId}`)