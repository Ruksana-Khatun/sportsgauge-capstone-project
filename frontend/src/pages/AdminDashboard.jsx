import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { apiCall } from '../utils/api.js'
import { useApp } from '../context/AppContext.jsx'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useApp()
  
  // Dashboard dynamic states
  const [stats, setStats] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('submissions') // 'submissions' | 'players'
  
  // Review specific states
  const [reviewingSub, setReviewingSub] = useState(null)
  const [reviewResult, setReviewResult] = useState('approved') // 'approved' | 'rejected'
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Check permission - must be admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }, [user, navigate])

  const loadData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      // 1. Fetch Stats
      const statsRes = await apiCall('/admin/stats')
      if (statsRes.success) {
        setStats(statsRes.stats)
      }

      // 2. Fetch Submissions
      const subRes = await apiCall('/admin/submissions')
      if (subRes.success) {
        setSubmissions(subRes.submissions)
      }

      // 3. Fetch Players
      const playersRes = await apiCall('/admin/players')
      if (playersRes.success) {
        setPlayers(playersRes.players)
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setErrorMsg(err.message || 'Failed to sync with API database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Trigger backend video AI analysis
  const handleTriggerAI = async (subId, videoUrl) => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      setSuccessMsg('Analyzing video patterns...')
      const res = await apiCall('/ai/analyze', {
        method: 'POST',
        body: {
          submission_id: subId,
          video_url: videoUrl
        }
      })
      if (res.success) {
        setSuccessMsg(`AI check complete! Result: ${res.result.ai_result}`)
        loadData()
      }
    } catch (err) {
      setErrorMsg('AI execution failed: ' + err.message)
    }
  }

  // Submit Admin Review Decision
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewingSub) return
    setReviewLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await apiCall(`/admin/submissions/${reviewingSub.id}/review`, {
        method: 'PUT',
        body: {
          admin_result: reviewResult,
          admin_feedback: reviewFeedback
        }
      })

      if (res.success) {
        setSuccessMsg(`Submission reviewed and marked as ${reviewResult}!`)
        setReviewingSub(null)
        setReviewFeedback('')
        loadData()
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review.')
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-sg-yellow font-sans px-6 pt-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sg-yellow/20 pb-4 mb-8">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <span className="text-[12px] bg-red-600/35 border border-red-500 text-red-200 px-3 py-1 rounded-full font-bold">
            Administrator Mode
          </span>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="text-red-400 text-xs font-semibold hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-sg-yellow mb-2">Admin Dashboard</h1>
      <p className="text-sg-yellow/60 text-xs mb-8">Real-time candidate monitoring and physical test verification engine.</p>

      {errorMsg && (
        <div className="bg-red-900/60 border border-red-500 text-red-200 px-4 py-3 rounded-2xl mb-6 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-sg-green/20 border border-sg-green/40 text-sg-green px-4 py-3 rounded-2xl mb-6 text-xs text-center font-medium">
          {successMsg}
        </div>
      )}

      {/* Stats Cards Section */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#111] border border-sg-yellow/10 rounded-xl p-3 text-center space-y-1">
            <span className="text-[10px] text-white/50 font-bold block uppercase">Players</span>
            <span className="text-xl font-black text-white">{stats.total_players}</span>
          </div>
          <div className="bg-[#111] border border-sg-yellow/10 rounded-xl p-3 text-center space-y-1">
            <span className="text-[10px] text-white/50 font-bold block uppercase">Submissions</span>
            <span className="text-xl font-black text-white">{stats.total_submissions}</span>
          </div>
          <div className="bg-[#111] border border-sg-yellow/10 rounded-xl p-3 text-center space-y-1">
            <span className="text-[10px] text-white/50 font-bold block uppercase">Pending</span>
            <span className="text-xl font-black text-sg-green animate-pulse">{stats.pending_submissions}</span>
          </div>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-sg-yellow/20 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'submissions' 
              ? 'border-sg-yellow text-sg-yellow' 
              : 'border-transparent text-sg-yellow/55'
          }`}
        >
          Review Trials ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'players' 
              ? 'border-sg-yellow text-sg-yellow' 
              : 'border-transparent text-sg-yellow/55'
          }`}
        >
          Players Register ({players.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sg-yellow/60">Syncing with cloud databases...</div>
      ) : activeTab === 'submissions' ? (
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <div className="text-center py-10 text-sg-yellow/50">No submissions uploaded.</div>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="bg-[#0f0f0f] border border-sg-yellow/20 rounded-2xl p-5 space-y-4 hover:border-sg-yellow transition-all">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">{sub.users?.name || 'Unknown Candidate'}</h3>
                    <p className="text-[11px] text-sg-yellow/70">{sub.tests?.name || 'Trial Test'} ({sub.tests?.category || 'Sport'})</p>
                  </div>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                    sub.admin_result === 'approved' ? 'bg-sg-green/20 text-sg-green border border-sg-green/30' :
                    sub.admin_result === 'rejected' ? 'bg-red-950 text-red-400 border border-red-900' :
                    'bg-yellow-950 text-yellow-400 border border-yellow-900 animate-pulse'
                  }`}>
                    {sub.admin_result}
                  </span>
                </div>

                {/* Info pills */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/50 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-white/40 block font-bold">VIDEO LINK</span>
                    <a href={sub.video_url} target="_blank" rel="noreferrer" className="text-sg-green truncate block font-semibold hover:underline">
                      {sub.video_url}
                    </a>
                  </div>
                  <div className="bg-black/50 p-2 rounded-lg border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] text-white/40 block font-bold">AI STATUS (HF)</span>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-semibold ${sub.ai_result === 'pass' ? 'text-sg-green' : sub.ai_result === 'fail' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {sub.ai_result.toUpperCase()}
                      </span>
                      {sub.ai_result === 'pending' && (
                        <button 
                          onClick={() => handleTriggerAI(sub.id, sub.video_url)}
                          className="bg-sg-yellow text-black text-[9px] px-1.5 py-0.5 rounded font-bold hover:bg-sg-yellow-dark"
                        >
                          Run AI Check
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {sub.admin_feedback && (
                  <p className="text-[11px] text-white/70 italic border-l-2 border-sg-yellow/30 pl-2">
                    Review: "{sub.admin_feedback}"
                  </p>
                )}

                {/* Review trigger buttons */}
                {sub.admin_result === 'pending' && (
                  <button
                    onClick={() => setReviewingSub(sub)}
                    className="w-full py-2 bg-sg-yellow text-black text-xs font-bold rounded-xl active:scale-95 transition-all hover:bg-sg-yellow-dark"
                  >
                    Evaluate Submission
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {players.map(p => (
            <div key={p.id} className="bg-[#0f0f0f] border border-sg-yellow/10 rounded-xl p-4 flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-white">{p.name}</h4>
                <p className="text-[10px] text-sg-yellow/60">{p.email} | {p.phone || 'No phone'}</p>
                <p className="text-[9px] text-white/40 mt-1">{p.city}, {p.state}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                p.profile_complete ? 'bg-sg-green/20 text-sg-green' : 'bg-yellow-950 text-yellow-400'
              }`}>
                {p.profile_complete ? 'Complete' : 'Incomplete'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal popup */}
      {reviewingSub && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-[#111] border-2 border-sg-yellow rounded-[24px] p-6 max-w-sm w-full space-y-5">
            <div className="flex justify-between items-center border-b border-sg-yellow/20 pb-2">
              <h3 className="text-lg font-extrabold text-sg-yellow">Evaluate Trial</h3>
              <button onClick={() => setReviewingSub(null)} className="text-white text-sm hover:text-sg-yellow">✕</button>
            </div>
            
            <p className="text-xs text-white/80">
              Evaluating physical video for candidate <span className="text-sg-yellow font-bold">{reviewingSub.users?.name}</span>.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sg-yellow mb-1.5">Decision</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="decision" 
                      value="approved"
                      checked={reviewResult === 'approved'}
                      onChange={() => setReviewResult('approved')}
                      className="accent-sg-green"
                    />
                    <span className="text-sg-green">Approve candidate</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="decision" 
                      value="rejected"
                      checked={reviewResult === 'rejected'}
                      onChange={() => setReviewResult('rejected')}
                      className="accent-red-500"
                    />
                    <span className="text-red-400">Reject candidate</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-sg-yellow mb-1">Feedback Comments</label>
                <textarea
                  rows="3"
                  placeholder="Enter official evaluation notes or physical results..."
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  className="w-full bg-[#222] border border-sg-yellow/30 rounded-xl p-3 text-white text-xs placeholder-white/30 focus:outline-none focus:border-sg-yellow"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingSub(null)}
                  className="flex-1 py-2.5 bg-[#222] text-white text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 py-2.5 bg-sg-green text-black text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {reviewLoading ? 'Saving...' : 'Submit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-center mt-12 text-[12px] text-sg-yellow/50">
        <button onClick={() => navigate('/tests')} className="underline text-sg-yellow font-bold">
          ← View Player Dashboard
        </button>
      </div>
    </div>
  )
}
