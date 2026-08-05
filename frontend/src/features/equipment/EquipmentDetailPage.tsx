import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Truck, Fuel, MapPin, User, Building2, Calendar, Activity, Wrench, Brain, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Skeleton } from '../../components/ui/skeleton'
import { ProgressRing } from '../../components/common/ProgressRing'
import { StatusBadge } from '../../components/common/StatusBadge'
import { equipmentApi } from '../../api/endpoints'
import { cn, formatDate } from '../../lib/utils'
import type { EquipmentWithDetails, Alert } from '../../types/database'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [eq, setEq] = useState<EquipmentWithDetails | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([equipmentApi.getById(id), equipmentApi.getAlerts(id)]).then(([e, a]) => {
      setEq(e || null); setAlerts(a); setLoading(false)
    })
  }, [id])

  if (loading) return <div className="space-y-6"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
  if (!eq) return <div className="flex items-center justify-center h-64 text-muted-foreground">Equipment not found</div>

  const usageTrend = Array.from({ length: 14 }, (_, i) => ({ day: `Aug ${i + 1}`, hours: Math.round(4 + Math.random() * 8), fuel: Math.round(15 + Math.random() * 30) }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/equipment')} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Fleet
      </Button>

      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 relative flex items-center px-8 gap-8">
          <div className="w-32 h-32 rounded-2xl bg-navy-700/50 border border-white/10 flex items-center justify-center">
            <Truck className="h-16 w-16 text-construction-400/40" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{eq.name}</h1>
              <StatusBadge status={eq.status_name ?? 'Unknown'} />
            </div>
            <p className="text-navy-300 text-sm mb-3">{eq.equipment_id} • {eq.manufacturer} • {eq.equipment_type}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ProgressRing value={eq.health} size={48} strokeWidth={4} />
                <div><p className="text-xs text-navy-400">Health Score</p><p className="text-sm font-bold text-white">{eq.health}%</p></div>
              </div>
              {eq.current_site && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <div><p className="text-xs text-navy-400">Current Site</p><p className="text-sm font-medium text-white">{eq.current_site.name}</p></div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-status-maintenance" />
                <div><p className="text-xs text-navy-400">AI Failure Risk</p><p className={cn('text-sm font-bold', (eq.ai_failure_risk ?? 0) > 50 ? 'text-status-critical' : 'text-status-healthy')}>{(eq.ai_failure_risk ?? 0).toFixed(0)}%</p></div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {eq.active_rental && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="kpi-card"><div className="flex items-center gap-3"><User className="h-5 w-5 text-blue-500" /><div><p className="text-xs text-muted-foreground">Operator</p><p className="font-semibold text-sm">{eq.current_operator?.operator_name ?? '—'}</p></div></div></Card>
          <Card className="kpi-card"><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-construction-400" /><div><p className="text-xs text-muted-foreground">Customer</p><p className="font-semibold text-sm">{eq.current_customer?.name ?? '—'}</p></div></div></Card>
          <Card className="kpi-card"><div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-status-maintenance" /><div><p className="text-xs text-muted-foreground">Due On</p><p className="font-semibold text-sm">{formatDate(eq.active_rental.due_on)} ({eq.active_rental.rental_days} days)</p></div></div></Card>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Realtime</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="sensor">Sensor Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Equipment ID', value: eq.equipment_id },
              { label: 'Fuel Type', value: eq.fuel_type },
              { label: 'Fuel Level', value: `${eq.fuel_level?.toFixed(1)}%` },
              { label: 'Last Maintenance', value: formatDate(eq.last_maintenance_on) },
              { label: 'Latitude', value: eq.latitude.toFixed(4) },
              { label: 'Longitude', value: eq.longitude.toFixed(4) },
              { label: 'Maintenance Status', value: eq.maintenance_status ?? 'Healthy' },
              { label: 'Active Alerts', value: String(eq.active_alerts_count ?? 0) },
            ].map(i => (
              <Card key={i.label} className="kpi-card"><p className="text-[11px] text-muted-foreground">{i.label}</p><p className="font-semibold text-sm mt-1">{i.value}</p></Card>
            ))}
          </div>
          <Card className="chart-container">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Usage Trend (14 days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={usageTrend}>
                  <defs><linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F4B400" stopOpacity={0.3}/><stop offset="95%" stopColor="#F4B400" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="day" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="hours" stroke="#F4B400" strokeWidth={2} fill="url(#hGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-status-maintenance/30 bg-status-maintenance/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-status-maintenance" /> AI Recommendation</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Based on health score ({eq.health}%) and usage patterns, we recommend scheduling a preventive maintenance inspection within the next <strong className="text-foreground">14 days</strong>.</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <Card><CardContent className="pt-5">
            {eq.usage_realtime ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Operator</p><p className="font-medium">{eq.current_operator?.operator_name ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Fuel Gauge</p><p className="font-medium">{eq.usage_realtime.fuel_gauge}%</p></div>
                <div><p className="text-xs text-muted-foreground">Latitude</p><p className="font-medium">{eq.usage_realtime.latitude.toFixed(6)}</p></div>
                <div><p className="text-xs text-muted-foreground">Longitude</p><p className="font-medium">{eq.usage_realtime.longitude.toFixed(6)}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={eq.usage_realtime.status_id === 16 ? 'Running' : 'Idle'} /></div>
              </div>
            ) : <p className="text-muted-foreground text-sm">No realtime data available</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card><CardContent className="pt-5">
            {alerts.length > 0 ? alerts.map(a => (
              <div key={a.alert_id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
                <AlertTriangle className={cn('h-4 w-4 mt-0.5', a.status_id === 12 ? 'text-status-critical' : 'text-status-warning')} />
                <div className="flex-1">
                  <div className="flex items-center gap-2"><p className="font-medium text-sm">{a.alert_type}</p><Badge variant={a.status_id === 12 ? 'critical' : 'warning'} className="text-[10px]">{a.status_id === 12 ? 'Critical' : 'Active'}</Badge></div>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                </div>
              </div>
            )) : <p className="text-muted-foreground text-sm">No alerts</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="sensor" className="mt-4">
          <Card><CardContent className="pt-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Health', value: `${eq.health}%`, warn: eq.health < 50 },
                { label: 'Fuel Gauge', value: `${eq.fuel_level?.toFixed(1)}%`, warn: (eq.fuel_level ?? 0) < 30 },
                { label: 'GPS Lat', value: eq.latitude.toFixed(6), warn: false },
                { label: 'GPS Lng', value: eq.longitude.toFixed(6), warn: false },
                { label: 'Fuel Type', value: eq.fuel_type, warn: false },
                { label: 'Last Maintenance', value: formatDate(eq.last_maintenance_on), warn: false },
              ].map(s => (
                <Card key={s.label} className={cn('kpi-card', s.warn && 'border-status-warning/30 bg-status-warning/5')}>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn('font-semibold text-lg mt-1', s.warn && 'text-status-warning')}>{s.value}</p>
                </Card>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
