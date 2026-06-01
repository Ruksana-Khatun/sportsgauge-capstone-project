import { useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="mb-6">
          <img src={logoImg} alt="SportsGauge" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-4xl font-extrabold text-sg-yellow mb-3">SportsGauge</h1>
        <p className="text-sg-yellow/80 text-center">Sports Tests for Everyone</p>
      </div>
      
      <div className="bg-sg-yellow rounded-t-[40px] px-8 pt-12 pb-10">
        <h2 className="text-black text-2xl font-bold mb-2 leading-tight">
          Upload you test videos for examination from anywhere
        </h2>
        <p className="text-black/70 text-sm mb-8">Get evaluated by certified professionals</p>
        <button 
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-sg-green text-black font-semibold rounded-full text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  )
}