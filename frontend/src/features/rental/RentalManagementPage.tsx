import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, Building2, MapPin, DollarSign, Clock, Search, Filter, CheckCircle2, LogOut, CalendarPlus, QrCode } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { StatusBadge } from '../../components/common/StatusBadge'
import { rentalsApi, customersApi, sitesApi, equipmentApi } from '../../api/endpoints'
import { cn, formatDate } from '../../lib/utils'
import type { Rental, Customer, Site, EquipmentWithDetails } from '../../types/database'

export default function RentalManagementPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [equipment, setEquipment] = useState<EquipmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    Promise.all([rentalsApi.getAll(), customersApi.getAll(), sitesApi.getAll(), equipmentApi.getAllWithDetails()])
      .then(([r, c, s, e]) => { setRentals(r); setCustomers(c); setSites(s); setEquipment(e); setLoading(false) })
  }, [])

  const filtered = rentals.filter(r => {
    const eq = equipment.find(e => e.equipment_id === r.equipment_id)
    const cust = customers.find(c => c.customer_id === r.customer_id)
    const matchSearch = !search || eq?.name.toLowerCase().includes(search.toLowerCase()) || cust?.name.toLowerCase().includes(search.toLowerCase()) || r.rental_id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || r.rent_status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = [
    { label: 'Total Rentals', value: rentals.length, icon: FileText, color: 'text-blue-500' },
    { label: 'Active', value: rentals.filter(r => r.rent_status === 'Active').length, icon: CheckCircle2, color: 'text-status-healthy' },
    { label: 'Overdue', value: rentals.filter(r => r.rent_status === 'Overdue').length, icon: Clock, color: 'text-status-critical' },
    { label: 'Revenue', value: '$425K', icon: DollarSign, color: 'text-construction-400' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="page-header">Rental Management</h1><p className="page-description">Track and manage all equipment rentals across sites</p></div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="kpi-card">
            <div className={`p-2 rounded-lg bg-muted/50 w-fit ${s.color}`}><s.icon className="h-4 w-4" /></div>
            <p className="text-2xl font-bold mt-2">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search rentals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          {['All','Active','Completed','Overdue','Cancelled','Reserved'].map(s => <option key={s}>{s}</option>)}
        </select>
        <Button className="gap-2"><CalendarPlus className="h-4 w-4" /> New Rental</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              {['Rental ID','Equipment','Customer','Site','Due On','Days','Status','Actions'].map(h => (
                <th key={h} className="text-left p-3 font-medium text-muted-foreground text-xs">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {!loading && filtered.map(r => {
                const eq = equipment.find(e => e.equipment_id === r.equipment_id)
                const cust = customers.find(c => c.customer_id === r.customer_id)
                const site = sites.find(s => s.site_id === r.site_id)
                const daysRemaining = Math.ceil((new Date(r.due_on).getTime() - Date.now()) / 86400000)
                return (
                  <tr key={r.rental_id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{r.rental_id}</td>
                    <td className="p-3"><p className="font-medium text-sm">{eq?.name ?? r.equipment_id}</p><p className="text-xs text-muted-foreground">{r.equipment_id}</p></td>
                    <td className="p-3"><div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{cust?.name ?? '—'}</span></div></td>
                    <td className="p-3"><div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" /><span className="text-xs">{site?.name ?? '—'}</span></div></td>
                    <td className="p-3 text-xs">{formatDate(r.due_on)}</td>
                    <td className="p-3"><span className={cn('text-xs font-medium', daysRemaining < 0 ? 'text-status-critical' : daysRemaining < 7 ? 'text-status-warning' : '')}>{r.rental_days}d {daysRemaining < 0 ? `(${Math.abs(daysRemaining)}d overdue)` : daysRemaining < 7 ? `(${daysRemaining}d left)` : ''}</span></td>
                    <td className="p-3"><StatusBadge status={r.rent_status} /></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {r.rent_status === 'Active' && <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1"><LogOut className="h-3 w-3" />Check In</Button>}
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]"><QrCode className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}
