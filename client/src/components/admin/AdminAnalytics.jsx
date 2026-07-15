import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getAnalytics } from '../../api/analytics'

const COLORS = ['#e50914', '#f59e0b', '#10b981', '#3b82f6']
const GRID_STROKE = '#262626'
const AXIS_STROKE = '#a3a3a6'
const TOOLTIP_STYLE = { backgroundColor: '#171717', border: '1px solid #262626' }

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

  if (isLoading) return <p className="text-smoke">Loading analytics...</p>
  if (error) return <p className="text-flix-red">{error}</p>
  if (!data) return null

  const hasWatched = data.most_watched.length > 0
  const hasRated = data.most_rated.length > 0
  const hasSignups = data.signups_over_time.length > 0
  const hasPlans = data.active_subscriptions_by_plan.length > 0

  return (
    <div className="space-y-10 text-reel">
      <div>
        <h3 className="text-lg font-extrabold mb-4">Most Watched Titles</h3>
        {hasWatched ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.most_watched} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis type="number" stroke={AXIS_STROKE} allowDecimals={false} />
              <YAxis type="category" dataKey="title" stroke={AXIS_STROKE} width={150} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#e50914" name="Profiles watched" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-smoke text-sm">No watch data yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-extrabold mb-4">Top Rated Titles (Average Rating)</h3>
        {hasRated ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.most_rated} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis type="number" domain={[0, 10]} stroke={AXIS_STROKE} />
              <YAxis type="category" dataKey="title" stroke={AXIS_STROKE} width={150} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value, name, props) => [
                  `${value} / 10 (${props.payload.rating_count} ratings)`,
                  'Average rating',
                ]}
              />
              <Bar dataKey="average_rating" fill="#f59e0b" name="Average rating" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-smoke text-sm">No ratings yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-extrabold mb-4">Signups (Last 12 Months)</h3>
        {hasSignups ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.signups_over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="month" stroke={AXIS_STROKE} />
              <YAxis stroke={AXIS_STROKE} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="count" stroke="#e50914" strokeWidth={2} name="Signups" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-smoke text-sm">No signup data yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-extrabold mb-4">Active Subscriptions by Plan</h3>
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
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-smoke text-sm">No active subscriptions yet.</p>
        )}
      </div>
    </div>
  )
}