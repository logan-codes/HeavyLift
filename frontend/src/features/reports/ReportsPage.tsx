import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, BarChart3, Truck, Wrench, DollarSign, Brain, FileSpreadsheet, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'

const reportTypes = [
  { id: 'equipment', name: 'Equipment Report', desc: 'Fleet status, health scores, and utilization', icon: Truck, color: 'text-blue-500' },
  { id: 'rental', name: 'Rental Report', desc: 'Active rentals, revenue, and customer breakdown', icon: FileText, color: 'text-construction-400' },
  { id: 'maintenance', name: 'Maintenance Report', desc: 'Service history, costs, and upcoming schedules', icon: Wrench, color: 'text-status-maintenance' },
  { id: 'forecast', name: 'AI Forecast Report', desc: 'Demand predictions and anomaly analysis', icon: Brain, color: 'text-status-warning' },
  { id: 'revenue', name: 'Revenue Report', desc: 'Monthly revenue, ROI, and financial summary', icon: DollarSign, color: 'text-status-healthy' },
]

const recentReports = [
  { name: 'Weekly Fleet Status — Aug 4, 2026', type: 'Equipment', format: 'PDF', date: '2026-08-04' },
  { name: 'Monthly Revenue — July 2026', type: 'Revenue', format: 'Excel', date: '2026-08-01' },
  { name: 'Maintenance Summary — July 2026', type: 'Maintenance', format: 'PDF', date: '2026-08-01' },
  { name: 'AI Demand Forecast — Q3 2026', type: 'Forecast', format: 'PDF', date: '2026-07-28' },
  { name: 'Rental Activity — Week 30', type: 'Rental', format: 'CSV', date: '2026-07-25' },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Reports</h1><p className="page-description">Generate and export operational reports</p></div>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map(p => (
            <Button key={p} size="sm" variant={period === p ? 'default' : 'outline'} onClick={() => setPeriod(p)} className="capitalize text-xs">{p}</Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map(rt => (
          <Card key={rt.id} className="hover:shadow-card-hover transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-muted/50 ${rt.color}`}><rt.icon className="h-5 w-5" /></div>
                <div><CardTitle className="text-sm">{rt.name}</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{rt.desc}</p></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs gap-1"><FileDown className="h-3 w-3" /> PDF</Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs gap-1"><FileSpreadsheet className="h-3 w-3" /> Excel</Button>
                <Button size="sm" variant="outline" className="text-xs gap-1"><Download className="h-3 w-3" /> CSV</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Recent Reports</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentReports.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-sm font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.date}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                  <Badge variant="outline" className="text-[10px]">{r.format}</Badge>
                  <Button size="sm" variant="ghost" className="h-7"><Download className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
