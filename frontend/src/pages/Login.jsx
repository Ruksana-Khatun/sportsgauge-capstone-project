import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { apiCall } from '../utils/api.js'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Registration specific states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [aadharNumber, setAadharNumber] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { login } = useApp()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        // Player Login
        if (!email || !password) throw new Error('Email and password are required!')
        const res = await apiCall('/auth/login', {
          method: 'POST',
          body: { email, password }
        })
        
        if (res.success) {
          login(res.user, res.token)
          if (res.user.profile_complete) {
            navigate('/tests')
          } else {
            navigate('/profile/1')
          }
        }
      } else if (mode === 'register') {
        // Player Registration
        if (!name || !email || !password || !phone || !aadharNumber) {
          throw new Error('All fields are required for registration!')
        }
        const res = await apiCall('/auth/register', {
          method: 'POST',
          body: {
            name,
            email,
            password,
            phone,
            aadhar_number: aadharNumber
          }
        })
        
        if (res.success) {
          login(res.user, res.token)
          // New players always need to complete profile
          navigate('/profile/1')
        }
      } else if (mode === 'admin') {
        // Admin Login
        if (!email || !password) throw new Error('Admin credentials are required!')
        const res = await apiCall('/auth/admin/login', {
          method: 'POST',
          body: { email, password }
        })
        
        if (res.success) {
          login({ ...res.admin, role: 'admin' }, res.token)
          navigate('/tests') // We will redirect admins to dashboard or handle routing
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 pt-12 pb-8 flex flex-col justify-between">
      <div>
        <h1 className="text-[38px] font-extrabold text-sg-yellow leading-none mb-3">
          {mode === 'login' && 'Log In'}
          {mode === 'register' && 'Sign Up'}
          {mode === 'admin' && 'Admin Login'}
        </h1>
        <p className="text-sg-yellow/75 text-[14px] mb-8">
          {mode === 'login' && 'Welcome back! Please enter your details.'}
          {mode === 'register' && 'Create an account to start your physical evaluation.'}
          {mode === 'admin' && 'Access SportsGauge management dashboard.'}
        </p>

        {error && (
          <div className="bg-red-900/60 border border-red-500 text-red-200 px-4 py-3 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sg-yellow text-[14px] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter Your Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-yellow"
                  required
                />
              </div>
              <div>
                <label className="block text-sg-yellow text-[14px] mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter Your Phone Number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-yellow"
                  required
                />
              </div>
              <div>
                <label className="block text-sg-yellow text-[14px] mb-1 font-medium">Aadhar Number</label>
                <input
                  type="text"
                  placeholder="Enter 12 digit Aadhar Number"
                  value={aadharNumber}
                  onChange={e => setAadharNumber(e.target.value)}
                  className="input-yellow"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sg-yellow text-[14px] mb-1 font-medium">Email Address</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sg-yellow text-[14px] mb-1 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter Your Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-yellow"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-green mt-6 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'register' ? 'Register Account' : 'Connect'}
          </button>
        </form>

        <div className="text-center mt-6">
          {mode === 'login' ? (
            <p className="text-sg-yellow/70 text-sm">
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="font-bold underline text-sg-yellow hover:text-sg-yellow-dark">
                Sign Up
              </button>
            </p>
          ) : mode === 'register' ? (
            <p className="text-sg-yellow/70 text-sm">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="font-bold underline text-sg-yellow hover:text-sg-yellow-dark">
                Log In
              </button>
            </p>
          ) : (
            <button onClick={() => setMode('login')} className="text-sg-yellow font-medium text-sm hover:underline">
              Back to Player Login
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] flex-1 bg-sg-yellow/30" />
          <span className="text-sg-yellow/50 text-xs">Or Access</span>
          <div className="h-[1px] flex-1 bg-sg-yellow/30" />
        </div>

        <div className="space-y-3">
          {mode !== 'admin' ? (
            <button
              onClick={() => setMode('admin')}
              className="btn-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              Sign in as Administrator
            </button>
          ) : (
            <button
              onClick={() => setMode('login')}
              className="btn-white"
            >
              Sign in as Player
            </button>
          )}
        </div>

        <p className="text-center text-sg-yellow/50 text-[11px] mt-6">
          For more information, see our <span className="underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}