import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted']
const RESULT_OPTIONS = ['Pending', 'Passed', 'Failed']

function ApplicationDetail() {
  const { id } = useParams()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [application, setApplication] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  const { register: registerUpdate, handleSubmit: handleUpdate, reset: resetUpdate, formState: { isSubmitting: isUpdating } } = useForm()
  const { register: registerInterview, handleSubmit: handleAddInterview, reset: resetInterview, formState: { isSubmitting: isAddingInterview } } = useForm()

  useEffect(() => { initPage() }, [id])

  async function initPage() {
    setLoading(true)
    setError('')
    try {
      await Promise.all([fetchApplication(), fetchInterviews()])
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function fetchApplication() {
    try {
      const res = await api.get(`/applications/${id}`)
      const app = res.data.data || res.data
      setApplication(app)
      resetUpdate({
        companyName: app.companyName,
        role: app.role,
        status: app.status,
        jobLink: app.jobLink || '',
        notes: app.notes || ''
      })
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login') }
      throw err
    }
  }

  async function fetchInterviews() {
    try {
      const res = await api.get(`/applications/${id}/interviews`)
      setInterviews(res.data.data || res.data)
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login') }
      throw err
    }
  }

  async function onUpdateApplication(data) {
    setError('')
    setSuccess('')
    try {
      const res = await api.patch(`/applications/${id}`, data)
      setApplication(res.data.data || res.data)
      setSuccess('Application updated successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application')
    }
  }

  async function onAddInterview(data) {
    setError('')
    setSuccess('')
    try {
      await api.post(`/applications/${id}/interviews`, data)
      setSuccess('Interview stage added')
      resetInterview()
      await fetchInterviews()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add interview stage')
    }
  }

  async function onUpdateInterview(interviewId, result) {
    setError('')
    setSuccess('')
    try {
      await api.patch(`/interviews/${interviewId}`, { result })
      setSuccess('Interview updated')
      await fetchInterviews()
    } catch (err) {
      setError('Failed to update interview')
    }
  }

  async function onDeleteInterview(interviewId) {
    if (!confirm('Delete this interview stage?')) return
    setError('')
    setSuccess('')
    try {
      await api.delete(`/interviews/${interviewId}`)
      setSuccess('Interview deleted')
      await fetchInterviews()
    } catch (err) {
      setError('Failed to delete interview')
    }
  }

  async function onUploadResume(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await api.post(`/applications/${id}/upload-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Resume uploaded successfully')
      const app = res.data.data || res.data
      if (app?.resumeUrl) setApplication(prev => ({ ...prev, resumeUrl: app.resumeUrl }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  function getResultColor(result) {
    if (result === 'Passed') return 'bg-green-100 text-green-700'
    if (result === 'Failed') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/applications" className="text-gray-400 hover:text-gray-600 text-sm">← Applications</Link>
          <h1 className="text-xl font-bold text-gray-900">
            {application?.companyName} — {application?.role}
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
        {success && <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3">{success}</p>}

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Update Application</h2>
            <form onSubmit={handleUpdate(onUpdateApplication)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...registerUpdate('companyName', { required: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...registerUpdate('role', { required: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" {...registerUpdate('status')}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Link</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="url"
                  {...registerUpdate('jobLink')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  {...registerUpdate('notes')}
                />
              </div>
              <button
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Resume</h3>
              {application?.resumeUrl && (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-indigo-600 hover:underline block mb-3"
                >
                  View Current Resume →
                </a>
              )}
              <label className="block">
                <span className="text-sm text-gray-600 font-medium">Upload New Resume</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={onUploadResume}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
              </label>
              {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add Interview Stage</h2>
              <form onSubmit={handleAddInterview(onAddInterview)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage Name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Technical Round 1"
                    {...registerInterview('stageName', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="date"
                    {...registerInterview('scheduledDate')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" {...registerInterview('result')}>
                    {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={2}
                    {...registerInterview('notes')}
                  />
                </div>
                <button
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  type="submit"
                  disabled={isAddingInterview}
                >
                  {isAddingInterview ? 'Adding...' : 'Add Stage'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Interview Stages</h2>
              {interviews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No interview stages yet.</p>
              ) : (
                <div className="space-y-3">
                  {interviews.map(interview => (
                    <div key={interview._id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800">{interview.stageName}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getResultColor(interview.result)}`}>
                          {interview.result}
                        </span>
                      </div>
                      {interview.scheduledDate && (
                        <p className="text-xs text-gray-400 mb-2">
                          📅 {new Date(interview.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                      {interview.notes && <p className="text-xs text-gray-500 mb-2">{interview.notes}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <select
                          className="text-xs border rounded px-2 py-1 focus:outline-none"
                          defaultValue={interview.result}
                          onChange={e => onUpdateInterview(interview._id, e.target.value)}
                        >
                          {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                        <button
                          onClick={() => onDeleteInterview(interview._id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ApplicationDetail