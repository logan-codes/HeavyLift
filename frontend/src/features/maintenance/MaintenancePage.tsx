import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, GripVertical, AlertTriangle, Calendar, Clock, Brain, Truck } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ProgressRing } from '../../components/common/ProgressRing'
import { equipmentApi } from '../../api/endpoints'
import { cn, formatDate } from '../../lib/utils'
import type { EquipmentWithDetails } from '../../types/database'

const columns = ['Healthy', 'Inspection Due', 'Maintenance Scheduled', 'Repair In Progress', 'Completed'] as const
const columnColors: Record<string, string> = {
  'Healthy': 'border-t-status-healthy', 'Inspection Due': 'border-t-status-warning',
  'Maintenance Scheduled': 'border-t-status-maintenance', 'Repair In Progress': 'border-t-orange-500',
  'Completed': 'border-t-navy-400',
}

export default function MaintenancePage() {
  const [equipment, setEquipment] = useState<EquipmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    equipmentApi.getAllWithDetails().then(data => { setEquipment(data.filter(e => e.status_id !== 7)); setLoading(false) })
  }, [])

  const getColumnItems = (col: string) => {
    if (col === 'Completed') return equipment.filter(e => e.health >= 95).slice(0, 3)
    return equipment.filter(e => e.maintenance_status === col)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="page-header">Maintenance Center</h1><p className="page-description">Kanban board — drag equipment through maintenance pipeline</p></div>

      <div className="grid grid-cols-5 gap-4 min-h-[calc(100vh-220px)]">
        {columns.map(col => {
          const items = getColumnItems(col)
          return (
            <div key={col} className="flex flex-col">
              <div className={cn('flex items-center justify-between px-3 py-2 rounded-t-lg border-t-2 bg-muted/30', columnColors[col])}>
                <h3 className="text-xs font-semibold">{col}</h3>
                <Badge variant="outline" className="text-[10px] h-5">{items.length}</Badge>
              </div>
              <div className="flex-1 space-y-2 pt-2 pb-4">
                {items.map((eq, idx) => (
                  <motion.div key={eq.equipment_id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="p-3 hover:shadow-card-hover transition-all cursor-grab active:cursor-grabbing group">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-xs truncate">{eq.name}</p>
                            <ProgressRing value={eq.health} size={28} strokeWidth={2.5} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">{eq.equipment_id} • {eq.equipment_type}</p>
                          <div className="space-y-1 text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> Last: {formatDate(eq.last_maintenance_on)}</div>
                            {eq.ai_failure_risk !== undefined && (
                              <div className="flex items-center gap-1">
                                <Brain className="h-2.5 w-2.5" />
                                <span className={cn((eq.ai_failure_risk ?? 0) > 40 ? 'text-status-critical' : 'text-muted-foreground')}>
                                  AI Risk: {(eq.ai_failure_risk ?? 0).toFixed(0)}%
                                </span>
                              </div>
                            )}
                            {eq.current_site && (
                              <div className="flex items-center gap-1"><Truck className="h-2.5 w-2.5" /> {eq.current_site.name}</div>
                            )}
                          </div>
                          {(eq.active_alerts_count ?? 0) > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <AlertTriangle className="h-3 w-3 text-status-warning" />
                              <span className="text-[10px] text-status-warning">{eq.active_alerts_count} active alert{(eq.active_alerts_count ?? 0) > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-border/50 rounded-lg text-xs text-muted-foreground">
                    No equipment
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
