import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Job Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">👤 {user?.name}</span>
          <button onClick={handleLogout} className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Welcome back</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">{user?.name}</h2>
          <p className="text-gray-500 mt-1">Track your job applications and interview stages from one place.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { to: '/applications', icon: '📋', title: 'Applications', desc: 'Create and manage your job applications' },
            { to: '/analytics', icon: '📊', title: 'Analytics', desc: 'View status summary and insights' },
          ].map(card => (
            <Link
              key={card.to}
              to={card.to}
              className="bg-white rounded-xl border p-6 hover:shadow-md transition group"
            >
              <p className="text-4xl mb-3">{card.icon}</p>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard