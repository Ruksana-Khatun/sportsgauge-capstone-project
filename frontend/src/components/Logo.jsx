import logoImg from '../assets/logo.png'

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  }
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  }
  
  return (
    <div className="flex items-center gap-2">
      <img src={logoImg} alt="SportsGauge" className={`${sizes[size]} object-contain`} />
      <span className={`text-sg-yellow font-bold tracking-tight ${textSizes[size]}`}>SportsGauge</span>
    </div>
  )
}