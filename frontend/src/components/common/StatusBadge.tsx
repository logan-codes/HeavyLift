import { Badge } from '../ui/badge'
import { cn, getStatusColor } from '../../lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
  dot?: boolean
}

export function StatusBadge({ status, className, dot = true }: StatusBadgeProps) {
  const colorClasses = getStatusColor(status)

  return (
    <Badge variant="outline" className={cn('gap-1.5 border', colorClasses, className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', colorClasses.includes('healthy') ? 'bg-status-healthy' : colorClasses.includes('critical') || colorClasses.includes('red') ? 'bg-status-critical' : colorClasses.includes('warning') || colorClasses.includes('orange') ? 'bg-status-warning' : colorClasses.includes('maintenance') || colorClasses.includes('purple') ? 'bg-status-maintenance' : colorClasses.includes('blue') ? 'bg-blue-500' : colorClasses.includes('construction') ? 'bg-construction-400' : 'bg-status-idle')} />}
      {status}
    </Badge>
  )
}
