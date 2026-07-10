import apiClient from './client'

export const createCheckoutSession = (plan) =>
  apiClient.post('/billing/create-checkout-session', { plan })

export const createPortalSession = () =>
  apiClient.post('/billing/create-portal-session')