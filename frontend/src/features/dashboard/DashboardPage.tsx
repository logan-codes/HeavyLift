import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Activity, Fuel, Clock, AlertTriangle, Wrench,
  ShieldAlert, CalendarClock, CloudRain, Brain, TrendingUp,
  BarChart3, DollarSign, Zap, MapPin, AlertCircle, CheckCircle2,
  Bell, Cpu, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Skeleton } from '../../components/ui/skeleton'
import { ProgressRing } from '../../components/common/ProgressRing'
import { showToast } from '../../components/common/Toast'
import { dashboardApi } from '../../api/endpoints'
import { generateLiveEvent } from '../../mocks/data'
import { cn, formatCurrency, formatNumber } from '../../lib/utils'
import type { DashboardKPIs, LiveEvent } from '../../types/database'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [utilizationData, setUtilizationData] = useState<any[]>([])
  const [rentalData, setRentalData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [healthData, setHealthData] = useState<any[]>([])
  const [fuelData, setFuelData] = useState<any[]>([])
  const [maintenanceData, setMaintenanceData] = useState<any[]>([])

  const loadData = useCallback(async () => {
    const [k, u, r, rev, h, f, m] = await Promise.all([
      dashboardApi.getKPIs(),
      dashboardApi.getUtilizationChart(),
      dashboardApi.getRentalTrend(),
      dashboardApi.getRevenue(),
      dashboardApi.getHealthDistribution(),
      dashboardApi.getFuelConsumption(),
      dashboardApi.getMaintenanceTrend(),
    ])
    setKpis(k)
    setUtilizationData(u)
    setRentalData(r)
    setRevenueData(rev)
    setHealthData(h)
    setFuelData(f)
    setMaintenanceData(m)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Live event stream
  useEffect(() => {
    const interval = setInterval(() => {
      const event = generateLiveEvent()
      setEvents(prev => [event, ...prev].slice(0, 30))
      if (Math.random() > 0.6) showToast(event)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 mt-2" /></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const kpiSections = [
    {
      title: 'Usage Tracking',
      icon: Activity,
      color: 'text-blue-500',
      items: [
        { label: 'Total Equipment', value: kpis!.total_equipment, icon: Truck, trend: '+2', up: true },
        { label: 'Running', value: kpis!.running_equipment, icon: Zap, trend: '', up: true, color: 'text-status-healthy' },
        { label: 'Idle', value: kpis!.idle_equipment, icon: Clock, trend: '', up: false, color: 'text-status-idle' },
        { label: 'Utilization', value: `${kpis!.utilization_percent}%`, icon: BarChart3, trend: '+3.2%', up: true },
        { label: 'Engine Hrs Today', value: formatNumber(kpis!.engine_hours_today), icon: Activity, trend: '' },
        { label: 'Fuel Consumed', value: `${formatNumber(kpis!.fuel_consumption_today)}L`, icon: Fuel, trend: '-5%', up: false },
      ],
    },
    {
      title: 'Alerting Service',
      icon: AlertTriangle,
      color: 'text-status-critical',
      items: [
        { label: 'Critical Alerts', value: kpis!.critical_alerts, icon: AlertCircle, color: 'text-status-critical', trend: '' },
        { label: 'Maintenance Due', value: kpis!.maintenance_due, icon: Wrench, color: 'text-status-warning', trend: '' },
        { label: 'Unauthorized', value: kpis!.unauthorized_movement, icon: ShieldAlert, color: 'text-status-critical', trend: '' },
        { label: 'Overdue Rentals', value: kpis!.overdue_rentals, icon: CalendarClock, color: 'text-orange-500', trend: '' },
        { label: 'Weather Alerts', value: kpis!.weather_warnings, icon: CloudRain, color: 'text-blue-400', trend: '' },
      ],
    },
    {
      title: 'AI Forecasting',
      icon: Brain,
      color: 'text-status-maintenance',
      items: [
        { label: 'Predicted Demand', value: kpis!.predicted_demand, icon: TrendingUp, trend: '+12%', up: true },
        { label: 'Expected Rentals', value: kpis!.expected_rentals, icon: Truck, trend: '' },
        { label: 'Anomaly Count', value: kpis!.anomaly_count, icon: Cpu, color: 'text-status-warning', trend: '' },
        { label: 'Failure Risk', value: `${kpis!.failure_risk_score}%`, icon: AlertTriangle, color: 'text-status-warning', trend: '' },
      ],
    },
    {
      title: 'Revenue',
      icon: DollarSign,
      color: 'text-status-healthy',
      items: [
        { label: 'Monthly Revenue', value: formatCurrency(kpis!.monthly_revenue), icon: DollarSign, trend: '+8.3%', up: true },
        { label: 'Rental Revenue', value: formatCurrency(kpis!.rental_revenue), icon: TrendingUp, trend: '+12%', up: true },
        { label: 'Equipment ROI', value: `${kpis!.equipment_roi}%`, icon: BarChart3, trend: '+1.2%', up: true },
      ],
    },
  ]

  const eventIcons: Record<string, any> = {
    equipment_assigned: Truck,
    gps_updated: MapPin,
    maintenance_scheduled: Wrench,
    fuel_warning: Fuel,
    anomaly_detected: Brain,
    rental_completed: CheckCircle2,
    alert_generated: Bell,
    check_in: ArrowDownRight,
    check_out: ArrowUpRight,
  }

  const eventColors: Record<string, string> = {
    info: 'bg-blue-500/10 text-blue-500',
    success: 'bg-status-healthy/10 text-status-healthy',
    warning: 'bg-status-warning/10 text-status-warning',
    critical: 'bg-status-critical/10 text-status-critical',
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="page-header">Operations Center</h1>
        <p className="page-description">Real-time intelligence across all services — Usage Tracking • Alerting • AI Forecasting</p>
      </motion.div>

      {/* KPI Sections */}
      {kpiSections.map(section => (
        <motion.div key={section.title} variants={item}>
          <div className="flex items-center gap-2 mb-3">
            <section.icon className={cn('h-4 w-4', section.color)} />
            <h2 className="text-sm font-semibold text-muted-foreground">{section.title}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {section.items.map(kpi => (
              <Card key={kpi.label} className="kpi-card group cursor-default">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn('p-2 rounded-lg bg-muted/50', kpi.color)}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                  {kpi.trend && (
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', kpi.up ? 'bg-status-healthy/10 text-status-healthy' : 'bg-status-critical/10 text-status-critical')}>
                      {kpi.trend}
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold tracking-tight">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.label}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Charts Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Utilization Chart */}
        <Card className="chart-container col-span-1 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Equipment Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={utilizationData}>
                <defs>
                  <linearGradient id="utilGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4B400" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F4B400" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="utilization" stroke="#F4B400" strokeWidth={2} fill="url(#utilGradient)" />
                <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Equipment Health</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={healthData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                  {healthData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#F4B400" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rental Trend */}
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Rental Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={rentalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="active" stroke="#F4B400" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="new" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs text-muted-foreground capitalize">{value}</span>} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuel Consumption */}
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Fuel Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="diesel" fill="#F4B400" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="gasoline" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
                <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs text-muted-foreground capitalize">{value}</span>} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Event Stream */}
      <motion.div variants={item}>
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-healthy animate-pulse" />
                Live Event Stream
              </CardTitle>
              <Badge variant="outline" className="text-[10px] gap-1">
                <Activity className="h-3 w-3" /> Kafka Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <AnimatePresence>
                {events.map(event => {
                  const Icon = eventIcons[event.type] || Activity
                  const colorClass = eventColors[event.severity || 'info']
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0"
                    >
                      <div className={cn('p-1.5 rounded-md shrink-0 mt-0.5', colorClass)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{event.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{event.equipment_id} • {new Date(event.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {events.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  Waiting for events...
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
