import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortalSession } from '../api/billing'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleManageBilling() {
    setError('')
    setIsLoading(true)
    try {
      const res = await createPortalSession()
      window.location.href = res.data.portal_url
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to open billing portal')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-10">
      <button onClick={() => navigate(-1)} className="text-neutral-300 hover:text-white mb-6">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-8">Account</h1>

      <div className="max-w-lg bg-neutral-900 rounded-lg p-6 space-y-4">
        <div>
          <p className="text-neutral-500 text-sm">Email</p>
          <p>{user?.email}</p>
        </div>
        <div>
          <p className="text-neutral-500 text-sm">Current Plan</p>
          <p className="capitalize">{user?.subscription_plan || 'free'}</p>
        </div>
        <div>
          <p className="text-neutral-500 text-sm">Status</p>
          <p className="capitalize">{user?.subscription_status || 'No active subscription'}</p>
        </div>

        {error && <p className="text-orange-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          {user?.subscription_plan !== 'free' && (
            <button
              onClick={handleManageBilling}
              disabled={isLoading}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded font-medium"
            >
              {isLoading ? 'Loading...' : 'Manage Billing'}
            </button>
          )}
          <button
            onClick={() => navigate('/pricing')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
          >
            {user?.subscription_plan === 'free' ? 'Subscribe Now' : 'Change Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}