import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { apiCall } from '../utils/api.js'
import { useApp } from '../context/AppContext.jsx'

export default function TestsDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useApp()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  const fallbackTests = [
    { id: 'ssc', name: 'SSC CGL', category: 'Physical Test', description: 'Staff Selection Commission Physical Standard Test', color: 'bg-[#F5A623]' },
    { id: 'bpsc', name: 'BPSC', category: 'Physical Test', description: 'Bihar Public Service Commission Physical Test', color: 'bg-[#F5A623]' },
    { id: 'army', name: 'Army GD', category: 'Fitness', description: 'Indian Army General Duty Physical Fitness Test', color: 'bg-[#F5A623]' },
  ]

  useEffect(() => {
    async function loadTests() {
      try {
        const res = await apiCall('/tests')
        if (res.success && res.tests && res.tests.length > 0) {
          setTests(res.tests.map(t => ({
            ...t,
            color: 'bg-[#F5A623]'
          })))
        } else {
          setTests(fallbackTests)
        }
      } catch (err) {
        console.warn('Could not fetch tests from backend, using fallbacks:', err)
        setTests(fallbackTests)
      } finally {
        setLoading(false)
      }
    }

    loadTests()
  }, [])

  // If user is Admin, they should see a beautiful header link to go to Admin Dashboard
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen px-6 pt-8 pb-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-10">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="bg-sg-green text-black px-3 py-1 rounded-full text-xs font-bold hover:bg-sg-green/80 transition-all"
              >
                Admin Panel
              </button>
            )}
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="text-red-400 text-xs font-semibold hover:underline"
            >
              Logout
            </button>
            <button onClick={() => navigate('/menu')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FDBA12" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <h1 className="text-[36px] font-bold text-sg-yellow mb-2">Tests</h1>
        <p className="text-sg-yellow/70 text-sm mb-8">Select an evaluation program to upload and review your results.</p>

        {loading ? (
          <div className="text-center py-10 text-sg-yellow/60">Loading available tests...</div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {tests.map(test => (
              <button
                key={test.id}
                onClick={() => navigate('/upload', { state: { test } })}
                className={`${test.color || 'bg-[#F5A623]'} rounded-[20px] p-5 aspect-square flex flex-col items-center justify-center active:scale-95 transition-transform hover:opacity-95`}
              >
                <div className="bg-white rounded-xl p-3 mb-3 w-[90px] h-[90px] flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#DC2626"/>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#FDBA12" strokeWidth="2"/>
                    <text x="50" y="58" textAnchor="middle" fill="#FDBA12" fontSize="28" fontWeight="bold">स</text>
                  </svg>
                </div>
                <span className="text-black font-bold text-[15px] truncate w-full text-center">{test.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-12 text-[12px] text-sg-yellow/50">
        Connected to SportsGauge Secure Cloud Engine
      </div>
    </div>
  )
}