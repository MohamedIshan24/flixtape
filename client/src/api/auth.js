import apiClient from './client'

export const signup = (email, password) =>
  apiClient.post('/auth/signup', { email, password })

export const login = (email, password) =>
  apiClient.post('/auth/login', { email, password })

export const getCurrentUser = () =>
  apiClient.get('/auth/me')

export const changePassword = (currentPassword, newPassword) =>
  apiClient.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })

export const deleteAccount = () =>
  apiClient.delete('/auth/me')