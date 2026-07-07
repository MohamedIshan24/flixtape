import apiClient from './client'

export const signup = (email, password) =>
  apiClient.post('/auth/signup', { email, password })

export const login = (email, password) =>
  apiClient.post('/auth/login', { email, password })

export const getCurrentUser = () =>
  apiClient.get('/auth/me')