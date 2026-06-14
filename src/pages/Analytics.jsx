import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function Analytics() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchAnalytics() }, [])

  async function fetchAnalytics() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/analytics')
      setData(res.data.data || res.data)
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login') }
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status) {
    if (status === 'Offer') return 'bg-green-100 text-green-700'
    if (status === 'Interview') return 'bg-blue-100 text-blue-700'
    if (status === 'Rejected') return 'bg-red-100 text-red-700'
    if (status === 'Ghosted') return 'bg-gray-100 text-gray-500'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        </div>
        <button
          onClick={fetchAnalytics}
          className="text-sm border px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
        >
          Refresh
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8">
        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">{error}</p>}

        {loading ? (
          <p className="text-gray-400 text-center py-20">Loading analytics...</p>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Total', value: data.total ?? data.totalApplications ?? 0, color: 'bg-indigo-50 text-indigo-700' },
                { label: 'Applied', value: data.Applied ?? data.applied ?? 0, color: 'bg-yellow-50 text-yellow-700' },
                { label: 'Interview', value: data.Interview ?? data.interviews ?? 0, color: 'bg-blue-50 text-blue-700' },
                { label: 'Offer', value: data.Offer ?? data.offers ?? 0, color: 'bg-green-50 text-green-700' },
                { label: 'Rejected', value: data.Rejected ?? data.rejected ?? 0, color: 'bg-red-50 text-red-700' },
              ].map(card => (
                <div key={card.label} className={`rounded-xl p-4 text-center ${card.color}`}>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="text-xs font-semibold mt-1 uppercase tracking-wide">{card.label}</p>
                </div>
              ))}
            </div>

            {(data.byStatus || data.statusBreakdown) && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Status Breakdown</h2>
                <div className="space-y-3">
                  {Object.entries(data.byStatus || data.statusBreakdown || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-24 text-center ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (count / (data.total || data.totalApplications || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-20">No analytics data available.</p>
        )}
      </main>
    </div>
  )
}

export default Analytics