import apiClient from './client'

export const getNotifications = (profileId) =>
  apiClient.get(`/profiles/${profileId}/notifications/`)

export const markNotificationRead = (profileId, notificationId) =>
  apiClient.patch(`/profiles/${profileId}/notifications/${notificationId}/read`)

export const deleteNotification = (profileId, notificationId) =>
  apiClient.delete(`/profiles/${profileId}/notifications/${notificationId}`)