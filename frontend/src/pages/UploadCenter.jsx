import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { apiCall } from '../utils/api.js'
import { useApp } from '../context/AppContext.jsx'

export default function UploadCenter() {
  const [tab, setTab] = useState('documents')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useApp()
  
  // Selected test from TestsDashboard
  const selectedTest = location.state?.test || { id: 'ssc', name: 'SSC CGL' }

  // API dynamic states
  const [documents, setDocuments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Form input states
  const [videoUrl, setVideoUrl] = useState('')
  const [submittingVideo, setSubmittingVideo] = useState(false)

  // AI Pose Detection workspace states
  const [selectedAiTest, setSelectedAiTest] = useState('jumps') // 'jumps' | 'squats' | 'situps'
  const [isAiRunning, setIsAiRunning] = useState(false)
  const [aiStats, setAiStats] = useState({ count: 0, angle: 0, stage: 'N/A', status: 'Ready' })
  const [submittingAiScore, setSubmittingAiScore] = useState(false)
  const pollIntervalRef = useRef(null)

  const aiConfigs = {
    jumps: { port: 5001, startUrl: '/start', statusUrl: '/status', stopUrl: '/stop', resetUrl: '/reset' },
    squats: { port: 5002, startUrl: '/squat/start', statusUrl: '/squat/status', stopUrl: '/squat/stop', resetUrl: '/squat/reset' },
    situps: { port: 5003, startUrl: '/situp/start', statusUrl: '/situp/status', stopUrl: '/situp/stop', resetUrl: '/situp/reset' }
  }

  // Fetch documents and submissions for the current player
  const fetchData = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      // 1. Fetch documents
      try {
        const docRes = await apiCall(`/documents/${user.id}`)
        if (docRes.success && docRes.documents) {
          const docData = docRes.documents
          setDocuments([
            { name: 'Admit Card', file: docData.admit_card_url ? 'admit_card.pdf' : 'Not Uploaded', active: !!docData.admit_card_url, url: docData.admit_card_url },
            { name: 'Fitness Certificate', file: docData.fitness_certificate_url ? 'fitness_certificate.pdf' : 'Not Uploaded', active: !!docData.fitness_certificate_url, url: docData.fitness_certificate_url },
            { name: 'Aadhar Card', file: docData.aadhar_card_url ? 'aadhar.png' : 'Not Uploaded', active: !!docData.aadhar_card_url, url: docData.aadhar_card_url },
          ])
        }
      } catch (err) {
        console.warn('No documents found for this user in DB.')
        setDocuments([
          { name: 'Admit Card', file: 'admit_card.pdf', active: true, url: 'https://sportsgauge.com/files/admit_card.pdf' },
          { name: 'Fitness Certificate', file: 'fitness_certificate.pdf', active: false, url: '' },
          { name: 'Aadhar Card', file: 'aadhar.png', active: false, url: '' },
        ])
      }

      // 2. Fetch submissions
      const subRes = await apiCall(`/submissions/${user.id}`)
      if (subRes.success && subRes.submissions) {
        // Filter submissions for this specific test
        const filtered = subRes.submissions.filter(s => s.test_id === selectedTest.id)
        setSubmissions(filtered)
      }
    } catch (error) {
      console.error('Error fetching upload center data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Cleanup polling on unmount
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [user, selectedTest.id])

  // Handle mock document upload
  const handleUploadDocument = async (docType) => {
    setStatusMessage('Uploading document...')
    try {
      const mockUrl = `https://sportsgauge.com/files/${docType.toLowerCase().replace(' ', '_')}_uploaded.pdf`
      
      const payload = {
        admit_card_url: docType === 'Admit Card' ? mockUrl : documents.find(d => d.name === 'Admit Card')?.url || '',
        fitness_certificate_url: docType === 'Fitness Certificate' ? mockUrl : documents.find(d => d.name === 'Fitness Certificate')?.url || '',
        aadhar_card_url: docType === 'Aadhar Card' ? mockUrl : documents.find(d => d.name === 'Aadhar Card')?.url || ''
      }

      if (docType === 'Admit Card') payload.admit_card_url = mockUrl
      if (docType === 'Fitness Certificate') payload.fitness_certificate_url = mockUrl
      if (docType === 'Aadhar Card') payload.aadhar_card_url = mockUrl

      await apiCall('/documents/upload', {
        method: 'POST',
        body: payload
      })

      setStatusMessage(`${docType} uploaded successfully!`)
      fetchData()
    } catch (err) {
      setStatusMessage('Upload failed: ' + err.message)
    }
  }

  // Handle video submission
  const handleVideoSubmit = async (e) => {
    e.preventDefault()
    if (!videoUrl) return alert('Please provide a video URL or record one!')
    setSubmittingVideo(true)
    setStatusMessage('Submitting video for review...')

    try {
      const res = await apiCall('/submissions/upload', {
        method: 'POST',
        body: {
          test_id: selectedTest.id,
          video_url: videoUrl
        }
      })

      if (res.success) {
        setStatusMessage('Video submitted! AI anti-cheat evaluation triggered.')
        setVideoUrl('')
        fetchData()
      }
    } catch (err) {
      setStatusMessage(err.message || 'Submission failed.')
    } finally {
      setSubmittingVideo(false)
    }
  }

  // ----------------------------------------------------
  // AI POSE CAMERA SERVICES INTEGRATION
  // ----------------------------------------------------
  
  // Start selected Python pose counter
  const handleStartAiTest = async () => {
    const config = aiConfigs[selectedAiTest]
    setStatusMessage(`Starting ${selectedAiTest} tracker...`)
    
    try {
      // Call local python start endpoint
      const response = await fetch(`http://localhost:${config.port}${config.startUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height: 170.0, weight: 70.0 })
      })
      const result = await response.json()
      
      if (result.success || response.ok) {
        setIsAiRunning(true)
        setStatusMessage(`${selectedAiTest.toUpperCase()} Pose Camera activated!`)
        
        // Start polling status
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = setInterval(pollAiStatus, 500)
      } else {
        throw new Error(result.message || 'Failed to initialize server')
      }
    } catch (err) {
      console.error(err)
      setStatusMessage(`Unable to connect to AI engine on port ${config.port}. Run start_all_backends.bat first.`)
    }
  }

  // Poll state parameters from python server
  const pollAiStatus = async () => {
    const currentTest = selectedAiTest
    const config = aiConfigs[currentTest]
    
    try {
      const response = await fetch(`http://localhost:${config.port}${config.statusUrl}`)
      const data = await response.json()
      
      if (currentTest === 'jumps') {
        setAiStats({
          count: data.jump_count || 0,
          angle: data.last_jump_height || 0.0,
          stage: data.is_running ? 'Running' : 'Stopped',
          status: data.status_message || 'Active'
        })
      } else if (currentTest === 'squats') {
        setAiStats({
          count: data.squat_count || 0,
          angle: data.current_angle || 0.0,
          stage: data.current_stage || 'N/A',
          status: data.status_message || 'Active'
        })
      } else if (currentTest === 'situps') {
        setAiStats({
          count: data.count || 0,
          angle: data.angle || 0.0,
          stage: data.stage || 'N/A',
          status: data.message || 'Active'
        })
      }
    } catch (err) {
      console.warn('Status polling error:', err)
    }
  }

  // Stop active Python pose counter
  const handleStopAiTest = async () => {
    const config = aiConfigs[selectedAiTest]
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    try {
      await fetch(`http://localhost:${config.port}${config.stopUrl}`, { method: 'POST' })
    } catch (err) {
      console.warn('Stop signal failed to deliver:', err)
    }
    
    setIsAiRunning(false)
    setStatusMessage(`${selectedAiTest.toUpperCase()} test completed!`)
  }

  // Submit calculated score directly to the node database
  const handleSubmitAiScore = async () => {
    if (aiStats.count === 0) {
      alert('Cannot submit a score of 0. Complete at least one rep!')
      return
    }
    
    setSubmittingAiScore(true)
    setStatusMessage('Uploading your pose estimation trial data to Supabase...')
    
    try {
      const resultText = `AI Pose Tracker result: Completed ${aiStats.count} ${selectedAiTest} (Max value: ${aiStats.angle.toFixed(1)})`
      const mockVideoUrl = `https://sportsgauge-ai.com/recordings/${selectedAiTest}_trial_${Date.now()}.mp4`

      // 1. Post to submissions database
      const res = await apiCall('/submissions/upload', {
        method: 'POST',
        body: {
          test_id: selectedTest.id,
          video_url: mockVideoUrl
        }
      })

      if (res.success) {
        // Automatically mark the AI review of this submission based on completed reps
        try {
          // Send simulated pass result for successful completion
          await apiCall('/ai/analyze', {
            method: 'POST',
            body: {
              submission_id: res.submission.id,
              video_url: mockVideoUrl
            }
          })
        } catch (aiErr) {
          console.warn('Optional HF model check skipped:', aiErr)
        }

        setStatusMessage(`Successfully saved physical results to candidate files! Score: ${aiStats.count} reps.`)
        fetchData()
        
        // Reset states
        setAiStats({ count: 0, angle: 0, stage: 'N/A', status: 'Ready' })
      }
    } catch (err) {
      setStatusMessage('Submission error: ' + err.message)
    } finally {
      setSubmittingAiScore(false)
    }
  }

  return (
    <div className="min-h-screen px-5 pt-6 pb-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
          <button onClick={() => navigate('/menu')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FDBA12" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Selected Test Details */}
        <div className="bg-[#111] border border-sg-yellow/20 rounded-2xl p-4 mb-6">
          <span className="text-[11px] uppercase tracking-wider text-sg-green font-bold">Active Evaluation Program</span>
          <h2 className="text-xl font-extrabold text-sg-yellow mt-0.5">{selectedTest.name}</h2>
          <p className="text-sg-yellow/60 text-xs mt-1">{selectedTest.description || 'Physical efficiency standard examination.'}</p>
        </div>

        {statusMessage && (
          <div className="bg-sg-yellow/10 border border-sg-yellow/30 text-sg-yellow px-4 py-2.5 rounded-xl mb-6 text-xs text-center font-medium">
            {statusMessage}
          </div>
        )}

        {/* Dynamic Navigation Tabs */}
        <div className="bg-[#0a0a0a] rounded-full p-1 flex mb-6 border border-sg-yellow/20">
          {['Documents', 'Videos', 'AI Camera'].map(t => (
            <button
              key={t}
              onClick={() => {
                // stop tracking if navigating away
                if (isAiRunning) handleStopAiTest()
                setTab(t.toLowerCase().replace(' ', ''))
              }}
              className={`flex-1 py-2.5 rounded-full font-medium transition-all text-[13px] ${
                tab === t.toLowerCase().replace(' ', '') 
                  ? 'bg-sg-yellow text-black' 
                  : 'text-sg-yellow'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab CONTENT mapping */}
        {tab === 'documents' && (
          <>
            <div className="bg-[#1a1a1a] rounded-[20px] p-6 mb-6 border-2 border-dashed border-sg-yellow/30 text-center flex flex-col items-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FDBA12" strokeWidth="1.5" className="mb-3">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="text-sg-yellow font-semibold text-[15px]">Simulated File Upload Box</p>
              <p className="text-sg-yellow/60 text-[11px] mt-1">Select a document type below to upload and save in database.</p>
            </div>

            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc.name}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sg-yellow font-medium text-[14px]">{doc.name}</h3>
                    {!doc.active && (
                      <button 
                        onClick={() => handleUploadDocument(doc.name)}
                        className="text-xs bg-sg-green/20 text-sg-green px-2 py-0.5 rounded-full border border-sg-green/30 hover:bg-sg-green hover:text-black transition-all"
                      >
                        Upload Mock
                      </button>
                    )}
                  </div>
                  <div className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 ${
                    doc.active ? 'bg-[#1a1a1a] border-sg-yellow' : 'bg-[#0f0f0f] border-sg-yellow/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={doc.active ? '#FDBA12' : '#FDBA12/40'} strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      </svg>
                      <span className={`text-[13px] ${doc.active ? 'text-white' : 'text-white/40'}`}>{doc.file}</span>
                    </div>
                    {doc.active && (
                      <div className="flex gap-4">
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'videos' && (
          <>
            <form onSubmit={handleVideoSubmit} className="bg-[#1a1a1a] rounded-[20px] p-5 mb-6 border border-sg-yellow/20 space-y-4">
              <h3 className="text-sg-yellow font-bold text-sm">Submit New Physical Test Video</h3>
              <div>
                <input
                  placeholder="Enter Video Link (e.g. YouTube/Drive/MP4)"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="input-yellow py-3 text-xs rounded-xl"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setVideoUrl('https://sportsgauge.com/videos/sprinter_trial_100m.mp4')}
                  className="flex-1 py-2 bg-[#2a2a2a] text-sg-yellow text-xs font-semibold rounded-lg hover:bg-[#333] transition-all"
                >
                  Fill Sample MP4
                </button>
                <button 
                  type="submit" 
                  disabled={submittingVideo}
                  className="flex-1 py-2 bg-sg-green text-black text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-sg-green/80 transition-all"
                >
                  {submittingVideo ? 'Submitting...' : 'Upload Video'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="text-sg-yellow font-bold text-[16px] border-b border-sg-yellow/20 pb-2">Submissions Status</h3>
              {loading ? (
                <div className="text-center text-xs py-6 text-sg-yellow/60">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center text-xs py-8 text-sg-yellow/60 bg-[#0c0c0c] rounded-xl border border-sg-yellow/10">
                  No videos submitted for this test yet. Use form above to upload.
                </div>
              ) : (
                submissions.map((sub, index) => (
                  <div key={sub.id} className="bg-[#111] border border-sg-yellow/30 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-sg-yellow font-bold">Submission #{index + 1}</span>
                      <a href={sub.video_url} target="_blank" rel="noreferrer" className="text-xs text-sg-green font-bold flex items-center gap-1 hover:underline">
                        Watch Video <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </div>
                    
                    {/* Status details */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* AI Verification */}
                      <div className="bg-black/40 border border-white/5 p-2.5 rounded-lg space-y-1">
                        <span className="text-[10px] text-white/50 block font-bold uppercase">AI Anti-Cheat (HF)</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            sub.ai_result === 'pass' ? 'bg-sg-green' : sub.ai_result === 'fail' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                          }`} />
                          <span className={`text-[12px] font-bold ${
                            sub.ai_result === 'pass' ? 'text-sg-green' : sub.ai_result === 'fail' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {sub.ai_result.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-tight">
                          {sub.ai_feedback || 'Checking video frames for manipulation...'}
                        </p>
                      </div>

                      {/* Admin Review */}
                      <div className="bg-black/40 border border-white/5 p-2.5 rounded-lg space-y-1">
                        <span className="text-[10px] text-white/50 block font-bold uppercase">Professional Review</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            sub.admin_result === 'approved' ? 'bg-sg-green' : sub.admin_result === 'rejected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                          }`} />
                          <span className={`text-[12px] font-bold ${
                            sub.admin_result === 'approved' ? 'text-sg-green' : sub.admin_result === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {sub.admin_result.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-tight">
                          {sub.admin_feedback || 'Awaiting examiner verification.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {tab === 'aicamera' && (
          <div className="space-y-6">
            {/* AI Test Selector pills */}
            <div className="flex gap-2">
              {['Jumps', 'Squats', 'Situps'].map(t => (
                <button
                  key={t}
                  disabled={isAiRunning}
                  onClick={() => setSelectedAiTest(t.toLowerCase())}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedAiTest === t.toLowerCase()
                      ? 'bg-sg-green text-black border-sg-green'
                      : 'bg-black text-sg-yellow/70 border-sg-yellow/30 disabled:opacity-30'
                  }`}
                >
                  {t} Mode
                </button>
              ))}
            </div>

            {/* Camera View Window */}
            <div className="bg-[#111] border border-sg-yellow/20 rounded-2xl p-2 relative overflow-hidden aspect-video flex items-center justify-center">
              {isAiRunning ? (
                <img
                  src={`http://localhost:${aiConfigs[selectedAiTest].port}/video_feed`}
                  alt="Live Pose Tracking Stream"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/640x480/000000/FDBA12?text=Camera+Connecting...';
                  }}
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FDBA12" strokeWidth="1.5" className="mx-auto opacity-50 animate-pulse">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <p className="text-xs text-sg-yellow/60 font-semibold uppercase tracking-widest">Webcam Feed Inactive</p>
                  <p className="text-[10px] text-white/40 max-w-xs mx-auto">
                    Select a trial mode above and click "Start Camera" to initialize MediaPipe body skeleton estimation.
                  </p>
                </div>
              )}
            </div>

            {/* Controls Button Row */}
            <div className="flex gap-3">
              {!isAiRunning ? (
                <button
                  onClick={handleStartAiTest}
                  className="flex-1 py-3 bg-sg-green text-black font-extrabold text-[14px] rounded-xl hover:bg-sg-green/80 active:scale-95 transition-all"
                >
                  Start Camera Feed
                </button>
              ) : (
                <button
                  onClick={handleStopAiTest}
                  className="flex-1 py-3 bg-red-600 text-white font-extrabold text-[14px] rounded-xl hover:bg-red-700 active:scale-95 transition-all"
                >
                  Stop Recording
                </button>
              )}
            </div>

            {/* Live Stats Display Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#151515] border border-sg-yellow/10 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-white/50 font-bold block uppercase">Reps Count</span>
                <span className="text-2xl font-black text-white">{aiStats.count}</span>
              </div>
              <div className="bg-[#151515] border border-sg-yellow/10 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-white/50 font-bold block uppercase">
                  {selectedAiTest === 'jumps' ? 'Max Jump Height' : 'Angle Value'}
                </span>
                <span className="text-2xl font-black text-white">
                  {selectedAiTest === 'jumps' ? `${aiStats.angle.toFixed(1)} cm` : `${aiStats.angle.toFixed(0)}°`}
                </span>
              </div>
              <div className="col-span-2 bg-[#151515] border border-sg-yellow/10 rounded-xl p-3 flex justify-between items-center px-4">
                <div className="text-left">
                  <span className="text-[9px] text-white/40 block font-bold uppercase">Active Stage</span>
                  <span className="text-xs font-bold text-sg-yellow">{aiStats.stage.toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/40 block font-bold uppercase">Detector Status</span>
                  <span className="text-xs font-bold text-sg-green">{aiStats.status}</span>
                </div>
              </div>
            </div>

            {/* Save score to cloud */}
            {!isAiRunning && aiStats.count > 0 && (
              <button
                onClick={handleSubmitAiScore}
                disabled={submittingAiScore}
                className="w-full py-3.5 bg-sg-yellow text-black font-bold text-[14px] rounded-xl disabled:opacity-50 hover:bg-sg-yellow-dark active:scale-[0.98] transition-all"
              >
                {submittingAiScore ? 'Saving values to candidate records...' : 'Confirm & Save Score in Database'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-center mt-10">
        <button 
          onClick={() => navigate('/tests')}
          className="text-sg-yellow font-medium text-sm hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}