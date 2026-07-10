import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getAnalytics } from '../../api/analytics'

const COLORS = ['#dc2626', '#f59e0b', '#10b981', '#3b82f6']

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const res = await getAnalytics()
        setData(res.data)
      } catch (err) {
        setError('Failed to load analytics')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) return <p className="text-neutral-400">Loading analytics...</p>
  if (error) return <p className="text-orange-400">{error}</p>
  if (!data) return null

  const hasWatched = data.most_watched.length > 0
  const hasRated = data.most_rated.length > 0
  const hasSignups = data.signups_over_time.length > 0
  const hasPlans = data.active_subscriptions_by_plan.length > 0

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-bold mb-4">Most Watched Titles</h3>
        {hasWatched ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.most_watched} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#999" allowDecimals={false} />
              <YAxis type="category" dataKey="title" stroke="#999" width={150} />
              <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }} />
              <Bar dataKey="value" fill="#dc2626" name="Profiles watched" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-neutral-500 text-sm">No watch data yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Most Rated Titles</h3>
        {hasRated ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.most_rated} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#999" allowDecimals={false} />
              <YAxis type="category" dataKey="title" stroke="#999" width={150} />
              <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }} />
              <Bar dataKey="value" fill="#f59e0b" name="Rating count" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-neutral-500 text-sm">No ratings yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Signups (Last 12 Months)</h3>
        {hasSignups ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.signups_over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} name="Signups" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-neutral-500 text-sm">No signup data yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Active Subscriptions by Plan</h3>
        {hasPlans ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.active_subscriptions_by_plan}
                dataKey="count"
                nameKey="plan"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.plan}: ${entry.count}`}
              >
                {data.active_subscriptions_by_plan.map((entry, index) => (
                  <Cell key={entry.plan} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-neutral-500 text-sm">No active subscriptions yet.</p>
        )}
      </div>
    </div>
  )
}