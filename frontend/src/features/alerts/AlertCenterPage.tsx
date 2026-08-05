import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Bell, Fuel, Clock, ShieldAlert, CloudRain, WifiOff, Thermometer, CheckCircle2, UserPlus, Search, Filter } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { StatusBadge } from '../../components/common/StatusBadge'
import { alertsApi, equipmentApi } from '../../api/endpoints'
import { getStatusName } from '../../mocks/data'
import { cn } from '../../lib/utils'
import type { Alert, EquipmentWithDetails } from '../../types/database'

const alertIcons: Record<string, any> = {
  'Fuel Low': Fuel, 'Rental Expiring': Clock, 'Idle Too Long': Clock,
  'Overheating': Thermometer, 'Maintenance Due': AlertTriangle,
  'Equipment Offline': WifiOff, 'Unauthorized Movement': ShieldAlert,
  'Weather Warning': CloudRain,
}

const priorityFromStatus = (statusId: number) => statusId === 12 ? 'Critical' : statusId === 13 ? 'Acknowledged' : statusId === 14 ? 'Resolved' : 'Active'

export default function AlertCenterPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [equipment, setEquipment] = useState<EquipmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  useEffect(() => {
    Promise.all([alertsApi.getAll(), equipmentApi.getAllWithDetails()])
      .then(([a, e]) => { setAlerts(a); setEquipment(e); setLoading(false) })
  }, [])

  const types = ['All', ...new Set(alerts.map(a => a.alert_type))]
  const filtered = alerts.filter(a => {
    const eq = equipment.find(e => e.equipment_id === a.equipment_id)
    const matchSearch = !search || eq?.name.toLowerCase().includes(search.toLowerCase()) || a.message.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || a.alert_type === typeFilter
    const matchPriority = priorityFilter === 'All' || priorityFromStatus(a.status_id) === priorityFilter
    return matchSearch && matchType && matchPriority
  })

  const criticalCount = alerts.filter(a => a.status_id === 12).length
  const activeCount = alerts.filter(a => a.status_id === 1).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="page-header">Alert Center</h1><p className="page-description">Connected to Alerting Service — {criticalCount} critical, {activeCount} active alerts</p></div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Critical', value: criticalCount, color: 'text-status-critical bg-status-critical/10' },
          { label: 'Active', value: activeCount, color: 'text-status-warning bg-status-warning/10' },
          { label: 'Acknowledged', value: alerts.filter(a => a.status_id === 13).length, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Total', value: alerts.length, color: 'text-muted-foreground bg-muted/50' },
        ].map(s => (
          <Card key={s.label} className="kpi-card">
            <div className={cn('p-2 rounded-lg w-fit', s.color)}><Bell className="h-4 w-4" /></div>
            <p className="text-2xl font-bold mt-2">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          {['All','Critical','Active','Acknowledged'].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {!loading && filtered.map((alert, idx) => {
          const eq = equipment.find(e => e.equipment_id === alert.equipment_id)
          const Icon = alertIcons[alert.alert_type] || AlertCircle
          const priority = priorityFromStatus(alert.status_id)
          return (
            <motion.div key={alert.alert_id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
              <Card className={cn('p-4 hover:shadow-card-hover transition-all', alert.status_id === 12 && 'border-status-critical/30 bg-status-critical/5')}>
                <div className="flex items-start gap-4">
                  <div className={cn('p-2.5 rounded-lg', alert.status_id === 12 ? 'bg-status-critical/10 text-status-critical' : 'bg-status-warning/10 text-status-warning')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{alert.alert_type}</p>
                      <Badge variant={priority === 'Critical' ? 'critical' : priority === 'Acknowledged' ? 'default' : 'warning'} className="text-[10px]">{priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{eq?.name ?? alert.equipment_id}</span>
                      {eq?.current_site && <span>📍 {eq.current_site.name}</span>}
                      {alert.rental_id && <span>Rental: {alert.rental_id}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Resolve</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><UserPlus className="h-3 w-3" /> Assign</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
