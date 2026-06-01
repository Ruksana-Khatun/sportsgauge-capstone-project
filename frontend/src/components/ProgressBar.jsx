export default function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-0 mb-8 px-1">
      {[1,2,3].map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`w-5 h-5 rounded-full ${s <= step ? 'bg-sg-green' : 'bg-white'} transition-all`} />
          {i < 2 && (
            <div className={`h-[2px] flex-1 ${s < step ? 'bg-sg-yellow' : 'bg-white/30'}`} />
          )}
        </div>
      ))}
    </div>
  )
}