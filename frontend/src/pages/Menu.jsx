import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function Menu() {
  const navigate = useNavigate()
  const items = ['Tests','Videos','Notification','Results','Complaints']

  return (
    <div className="min-h-screen px-6 pt-8">
      <div className="flex justify-center mb-16">
        <Logo size="md" />
      </div>

      <div className="space-y-10 text-center">
        {items.map(item => (
          <button
            key={item}
            onClick={() => navigate(item === 'Tests' ? '/tests' : '/upload')}
            className="block w-full"
          >
            <span className="text-[32px] font-light text-[#F5E6C8] hover:text-sg-yellow transition-colors">
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}