import { cn } from '../../lib/utils'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
  color?: string
}

export function ProgressRing({ value, size = 44, strokeWidth = 4, className, showValue = true, color }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference
  const colorClass = color || (value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444')

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="currentColor" fill="none" className="text-muted/30" />
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke={colorClass} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700 ease-out" />
      </svg>
      {showValue && (
        <span className="absolute text-xs font-bold" style={{ color: colorClass }}>
          {Math.round(value)}
        </span>
      )}
    </div>
  )
}
