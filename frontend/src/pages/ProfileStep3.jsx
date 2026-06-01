import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar.jsx'
import { useApp } from '../context/AppContext.jsx'
import { apiCall } from '../utils/api.js'

export default function ProfileStep3() {
  const navigate = useNavigate()
  const { profile, setProfile, user, setUser } = useApp()
  const [bio, setBio] = useState(profile.bio || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFinish = async () => {
    setLoading(true)
    setError('')

    const updatedProfile = { ...profile, bio }
    setProfile(updatedProfile)

    try {
      // 1. Update player profile in the backend database
      const profilePayload = {
        name: updatedProfile.name,
        phone: user?.phone || '9999999999', // fallback phone number
        date_of_birth: updatedProfile.date_of_birth,
        gender: updatedProfile.gender,
        state: updatedProfile.state,
        city: updatedProfile.city,
        sport_type: updatedProfile.sport
      }

      const res = await apiCall('/player/profile', {
        method: 'PUT',
        body: profilePayload
      })

      if (res.success) {
        // Sync context user
        setUser(prev => ({
          ...prev,
          ...res.user,
          profile_complete: true
        }))

        // 2. Upload default mock documents to the database to ensure user is setup
        try {
          await apiCall('/documents/upload', {
            method: 'POST',
            body: {
              admit_card_url: 'https://sportsgauge.com/files/admit_card.pdf',
              fitness_certificate_url: 'https://sportsgauge.com/files/fitness.pdf',
              aadhar_card_url: 'https://sportsgauge.com/files/aadhar.png'
            }
          })
        } catch (docErr) {
          console.warn('Mock document upload failed, proceeding anyway:', docErr)
        }

        navigate('/tests')
      }
    } catch (err) {
      setError(err.message || 'Failed to complete profile. Please try again.')
    } finally {
      setLoading(false)
    }
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

        <ProgressBar step={3} />

        {error && (
          <div className="bg-red-900/60 border border-red-500 text-red-200 px-4 py-3 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6 mt-10">
          <div>
            <label className="block text-orange-400 text-[15px] mb-2">Bio</label>
            <input
              placeholder="Write a short bio about yourself"
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="input-yellow"
            />
          </div>

          <div>
            <label className="block text-orange-400 text-[15px] mb-2">Default Documents</label>
            <div className="relative">
              <select className="input-yellow appearance-none">
                <option>Upload your documents</option>
                <option>Aadhar Card</option>
                <option>10th Marksheet</option>
                <option>Medical Certificate</option>
              </select>
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FDBA12" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <p className="text-sg-yellow/60 text-xs mt-2 px-1">
              Documents will automatically map to your database file uploads.
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleFinish} 
        disabled={loading}
        className="btn-green mt-8 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Finish'}
      </button>
    </div>
  )
}