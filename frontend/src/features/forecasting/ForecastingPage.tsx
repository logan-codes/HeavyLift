import { motion } from 'framer-motion'
import { Brain, TrendingUp, BarChart3, AlertTriangle, Truck, MapPin, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ProgressRing } from '../../components/common/ProgressRing'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const predictionData = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  demand: Math.round(15 + Math.random() * 20),
  predicted: Math.round(14 + Math.random() * 22),
  confidence: Math.round(75 + Math.random() * 20),
}))

const failureData = [
  { name: 'Excavators', risk: 28 }, { name: 'Bulldozers', risk: 42 }, { name: 'Wheel Loaders', risk: 15 },
  { name: 'Dump Trucks', risk: 35 }, { name: 'Cranes', risk: 22 }, { name: 'Rollers', risk: 55 },
  { name: 'Forklifts', risk: 12 }, { name: 'Generators', risk: 18 },
]

const recommendations = [
  { title: 'Deploy 2 additional Excavators to Phoenix', confidence: 94, reasoning: 'I-10 Highway project expanding scope. Demand forecast shows 5 excavators needed by Sept 1.', type: 'demand' },
  { title: 'Schedule preventive maintenance for EQ-006', confidence: 89, reasoning: 'Roller health at 45% with overheating alerts. Failure probability 55% within 14 days.', type: 'maintenance' },
  { title: 'Reassign EQ-007 Crane from SF to Houston', confidence: 78, reasoning: 'Crane idle 4.2h/day in SF. Houston Tower project needs crane capacity increase.', type: 'relocation' },
  { title: 'Extend EQ-005 rental by 30 days', confidence: 91, reasoning: 'Quarry hauling operations show consistent utilization. Customer likely to extend.', type: 'rental' },
]

const chartStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }

export default function ForecastingPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="page-header">AI Forecasting</h1><p className="page-description">Connected to Python AI Service — demand prediction, failure analysis, and recommendations</p></div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Predicted Demand', value: '27', sub: 'next 30 days', icon: TrendingUp, color: 'text-construction-400' },
          { label: 'Failure Risk Score', value: '34%', sub: 'fleet average', icon: AlertTriangle, color: 'text-status-warning' },
          { label: 'Forecast Accuracy', value: '91.2%', sub: 'last 90 days', icon: Brain, color: 'text-status-healthy' },
          { label: 'Anomalies Detected', value: '8', sub: 'last 7 days', icon: Zap, color: 'text-status-critical' },
        ].map(k => (
          <Card key={k.label} className="kpi-card">
            <div className={`p-2 rounded-lg bg-muted/50 w-fit ${k.color}`}><k.icon className="h-4 w-4" /></div>
            <p className="text-2xl font-bold mt-2">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-[10px] text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="chart-container">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Demand Prediction Curve</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}>
            <AreaChart data={predictionData}>
              <defs><linearGradient id="dG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F4B400" stopOpacity={0.3}/><stop offset="95%" stopColor="#F4B400" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="week" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
              <Tooltip contentStyle={chartStyle}/><Area type="monotone" dataKey="demand" stroke="#3B82F6" strokeWidth={2} fill="transparent" /><Area type="monotone" dataKey="predicted" stroke="#F4B400" strokeWidth={2} fill="url(#dG)" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer></CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Failure Probability by Type</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}>
            <BarChart data={failureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis type="number" tick={{fontSize:11}} /><YAxis dataKey="name" type="category" tick={{fontSize:10}} width={90} />
              <Tooltip contentStyle={chartStyle}/><Bar dataKey="risk" radius={[0,4,4,0]} fill="#F59E0B">
                {failureData.map((entry, i) => (<rect key={i} fill={entry.risk > 40 ? '#EF4444' : entry.risk > 25 ? '#F59E0B' : '#10B981'} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer></CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><Brain className="h-4 w-4 text-status-maintenance" /> AI Equipment Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="p-4 hover:shadow-card-hover transition-all border-status-maintenance/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-status-maintenance/10"><Brain className="h-4 w-4 text-status-maintenance" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{rec.title}</p>
                      <Badge variant="outline" className="text-[10px]">{rec.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rec.reasoning}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <ProgressRing value={rec.confidence} size={28} strokeWidth={3} color="#8B5CF6" />
                      <span className="text-xs font-medium">{rec.confidence}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
