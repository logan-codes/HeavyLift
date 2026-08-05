import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Clock, Fuel, Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { dashboardApi } from '../../api/endpoints'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function UsageAnalyticsPage() {
  const [utilization, setUtilization] = useState<any[]>([])
  const [fuel, setFuel] = useState<any[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [rental, setRental] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.getUtilizationChart(), dashboardApi.getFuelConsumption(), dashboardApi.getMaintenanceTrend(), dashboardApi.getRentalTrend()])
      .then(([u, f, m, r]) => { setUtilization(u); setFuel(f); setMaintenance(m); setRental(r); setLoading(false) })
  }, [])

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 gap-4">{Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-72 rounded-xl"/>)}</div></div>

  const chartStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="page-header">Usage Analytics</h1><p className="page-description">Connected to Usage Tracking Service — engine hours, fuel, idle time, and utilization</p></div>

      <div className="grid grid-cols-4 gap-4">
        {[{ label: 'Avg Utilization', value: '76%', icon: BarChart3, color: 'text-construction-400' },
          { label: 'Engine Hours Today', value: '187h', icon: Clock, color: 'text-blue-500' },
          { label: 'Fuel Consumed', value: '482L', icon: Fuel, color: 'text-status-warning' },
          { label: 'Efficiency Score', value: '84%', icon: Zap, color: 'text-status-healthy' },
        ].map(k => (
          <Card key={k.label} className="kpi-card">
            <div className={`p-2 rounded-lg bg-muted/50 w-fit ${k.color}`}><k.icon className="h-4 w-4" /></div>
            <p className="text-2xl font-bold mt-2">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="chart-container">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Equipment Utilization</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}>
            <AreaChart data={utilization}>
              <defs><linearGradient id="uG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F4B400" stopOpacity={0.3}/><stop offset="95%" stopColor="#F4B400" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
              <Tooltip contentStyle={chartStyle}/><Area type="monotone" dataKey="utilization" stroke="#F4B400" strokeWidth={2} fill="url(#uG)" /><Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer></CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Fuel Consumption by Day</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}>
            <BarChart data={fuel}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
              <Tooltip contentStyle={chartStyle}/><Bar dataKey="diesel" fill="#F4B400" radius={[4,4,0,0]} stackId="a" /><Bar dataKey="gasoline" fill="#3B82F6" radius={[4,4,0,0]} stackId="a" />
              <Legend iconType="circle" iconSize={8} formatter={(v:string) => <span className="text-xs text-muted-foreground capitalize">{v}</span>} />
            </BarChart>
          </ResponsiveContainer></CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Rental Frequency</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}>
            <LineChart data={rental}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
              <Tooltip contentStyle={chartStyle}/><Line type="monotone" dataKey="active" stroke="#F4B400" strokeWidth={2} dot={{r:3}} /><Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} dot={{r:3}} /><Line type="monotone" dataKey="new" stroke="#3B82F6" strokeWidth={2} dot={{r:3}} />
              <Legend iconType="circle" iconSize={8} formatter={(v:string) => <span className="text-xs text-muted-foreground capitalize">{v}</span>} />
            </LineChart>
          </ResponsiveContainer></CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Maintenance Trend</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}>
            <BarChart data={maintenance}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
              <Tooltip contentStyle={chartStyle}/><Bar dataKey="completed" fill="#10B981" radius={[4,4,0,0]} /><Bar dataKey="scheduled" fill="#3B82F6" radius={[4,4,0,0]} /><Bar dataKey="unplanned" fill="#EF4444" radius={[4,4,0,0]} />
              <Legend iconType="circle" iconSize={8} formatter={(v:string) => <span className="text-xs text-muted-foreground capitalize">{v}</span>} />
            </BarChart>
          </ResponsiveContainer></CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
