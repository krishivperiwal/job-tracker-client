import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted']

function getStatusColor(status) {
  if (status === 'Offer') return 'bg-green-100 text-green-700'
  if (status === 'Interview') return 'bg-blue-100 text-blue-700'
  if (status === 'Rejected') return 'bg-red-100 text-red-700'
  if (status === 'Ghosted') return 'bg-gray-100 text-gray-500'
  return 'bg-yellow-100 text-yellow-700'
}

function Applications() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => { fetchApplications() }, [statusFilter])

  async function fetchApplications() {
    setLoading(true)
    setError('')
    try {
      const query = statusFilter ? `?status=${statusFilter}` : ''
      const res = await api.get(`/applications${query}`)
      setApplications(res.data.data || res.data)
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login') }
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateApplication(data) {
    setError('')
    setSuccess('')
    try {
      await api.post('/applications', data)
      setSuccess('Application created successfully')
      reset()
      await fetchApplications()
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login') }
      setError(err.response?.data?.message || 'Failed to create application')
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this application?')) return
    setError('')
    setSuccess('')
    try {
      await api.delete(`/applications/${id}`)
      setSuccess('Application deleted')
      await fetchApplications()
    } catch (err) {
      setError('Failed to delete application')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <h1 className="text-xl font-bold text-gray-900">Applications</h1>
        </div>
        <Link to="/analytics" className="text-sm text-indigo-600 font-semibold hover:underline">View Analytics →</Link>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
        {success && <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3">{success}</p>}

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Application</h2>
          <form onSubmit={handleSubmit(onCreateApplication)} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                placeholder="Google"
                {...register('companyName', { required: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                placeholder="Software Engineer"
                {...register('role', { required: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" {...register('status')}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Link</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="url"
                placeholder="https://..."
                {...register('jobLink')}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={2}
                placeholder="Any notes..."
                {...register('notes')}
              />
            </div>
            <div className="col-span-2">
              <button
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Application'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Applications</h2>
            <select
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : applications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-gray-400 text-sm">No applications yet. Create your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app._id} className="border rounded-xl p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{app.companyName}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{app.role}</p>
                      {app.notes && <p className="text-xs text-gray-400 mt-1">{app.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/applications/${app._id}`}
                        className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => onDelete(app._id)}
                        className="text-xs bg-red-50 text-red-500 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {app.jobLink && (
                    <a href={app.jobLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline mt-2 block">
                      View Job Posting →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Applications