import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCheckoutSession } from '../api/billing'
import { useAuth } from '../context/AuthContext'

const PLANS = [
  { id: 'basic', name: 'Basic', price: '$8.99', features: ['720p streaming', '1 device at a time', 'Watch on your phone, tablet, or laptop'] },
  { id: 'standard', name: 'Standard', price: '$13.99', features: ['1080p Full HD', '2 devices at a time', 'Everything in Basic'] },
  { id: 'premium', name: 'Premium', price: '$17.99', features: ['4K Ultra HD', '4 devices at a time', 'Everything in Standard'] },
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [error, setError] = useState('')

  async function handleSubscribe(planId) {
    setError('')
    setLoadingPlan(planId)
    try {
      const res = await createCheckoutSession(planId)
      window.location.href = res.data.checkout_url
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start checkout')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-void text-reel px-4 md:px-8 py-10 font-display">
      <button onClick={() => navigate(-1)} className="text-smoke hover:text-reel mb-6 transition">
        ← Back
      </button>

      <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Choose your plan</h1>
      <p className="text-smoke mb-8">
        Current plan: <span className="text-reel capitalize">{user?.subscription_plan || 'free'}</span>
      </p>

      {error && <p className="text-flix-red mb-6">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {PLANS.map((plan) => {
          const isCurrent = user?.subscription_plan === plan.id
          return (
            <div
              key={plan.id}
              className={`bg-panel rounded-lg p-6 border ${
                isCurrent ? 'border-flix-red' : 'border-panel-line'
              }`}
            >
              <h2 className="text-xl font-extrabold mb-1">{plan.name}</h2>
              <p className="text-3xl font-extrabold mb-4">
                {plan.price}
                <span className="text-sm text-smoke font-normal">/month</span>
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-smoke text-sm flex gap-2">
                    <span className="text-flix-red">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || loadingPlan !== null}
                className={`w-full py-3 rounded font-bold transition ${
                  isCurrent
                    ? 'bg-void-soft text-smoke cursor-not-allowed'
                    : 'bg-flix-red hover:bg-flix-red-dim text-reel'
                }`}
              >
                {isCurrent ? 'Current Plan' : loadingPlan === plan.id ? 'Redirecting...' : 'Subscribe'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}