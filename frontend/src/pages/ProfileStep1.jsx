import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function ProfileStep1() {
  const navigate = useNavigate()
  const { profile, setProfile } = useApp()
  const [form, setForm] = useState({
    name: profile.name || '',
    date_of_birth: profile.date_of_birth || '',
    gender: profile.gender || ''
  })

  const handleContinue = () => {
    if (!form.name || !form.date_of_birth || !form.gender) {
      alert('Please fill all fields to continue!')
      return
    }
    setProfile({ ...profile, ...form })
    navigate('/profile/2')
  }

  return (
    <div className="min-h-screen px-6 pt-12 pb-8 flex flex-col justify-between">
      <div>
        <h1 className="text-[36px] font-bold text-sg-yellow leading-tight mb-2">
          Complete Your<br/>Profile
        </h1>
        <p className="text-sg-yellow/70 text-[13px] mb-8">
          This information will be used in official documents
        </p>

        <ProgressBar step={1} />

        <div className="space-y-6 mt-10">
          <div>
            <label className="block text-orange-400 text-[15px] mb-2">Name</label>
            <input
              placeholder="Enter Your Name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="input-yellow"
            />
          </div>

          <div>
            <label className="block text-orange-400 text-[15px] mb-2">Date of Birth</label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={e => setForm({...form, date_of_birth: e.target.value})}
              className="input-yellow"
            />
          </div>

          <div>
            <label className="block text-orange-400 text-[15px] mb-2">Gender</label>
            <div className="relative">
              <select
                value={form.gender}
                onChange={e => setForm({...form, gender: e.target.value})}
                className="input-yellow appearance-none"
              >
                <option value="">Select your gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
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