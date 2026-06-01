import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function ProfileStep2() {
  const navigate = useNavigate()
  const { profile, setProfile } = useApp()
  const [form, setForm] = useState({
    state: profile.state || '',
    city: profile.city || '',
    sport: profile.sport || '',
    position: profile.position || '',
    achievement: profile.achievement || ''
  })

  const handleContinue = () => {
    if (!form.state || !form.city || !form.sport) {
      alert('Please fill State, City and Sport to continue!')
      return
    }
    setProfile({ ...profile, ...form })
    navigate('/profile/3')
  }

  const statesList = [
    'Andhra Pradesh', 'Bihar', 'Delhi', 'Haryana', 'Karnataka', 
    'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh'
  ]

  return (
    <div className="min-h-screen px-6 pt-12 pb-8 flex flex-col justify-between">
      <div>
        <h1 className="text-[36px] font-bold text-sg-yellow leading-tight mb-2">
          Complete Your<br/>Profile
        </h1>
        <p className="text-sg-yellow/70 text-[13px] mb-8">
          This information will be used in official documents
        </p>

        <ProgressBar step={2} />

        <div className="space-y-6 mt-10">
          <div>
            <label className="block text-orange-400 text-[15px] mb-2">State</label>
            <div className="relative">
              <select
                value={form.state}
                onChange={e => setForm({...form, state: e.target.value})}
                className="input-yellow appearance-none"
              >
                <option value="">Select your State</option>
                {statesList.map(s => <option key={s}>{s}</option>)}
              </select>
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FDBA12" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-orange-400 text-[15px] mb-2">City</label>
            <input
              placeholder="Enter your City"
              value={form.city}
              onChange={e => setForm({...form, city: e.target.value})}
              className="input-yellow"
            />
          </div>

          <div>
            <label className="block text-orange-400 text-[15px] mb-2">Sport Type</label>
            <div className="relative">
              <select
                value={form.sport}
                onChange={e => setForm({...form, sport: e.target.value})}
                className="input-yellow appearance-none"
              >
                <option value="">Which sport do you play?</option>
                {['Athletics','Cricket','Football','Hockey','Wrestling'].map(o => <option key={o}>{o}</option>)}
              </select>
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FDBA12" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleContinue} className="btn-green mt-16">
        Continue
      </button>
    </div>
  )
}