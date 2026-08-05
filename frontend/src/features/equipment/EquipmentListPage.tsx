import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Grid3X3, List, Truck, Fuel, Clock, MapPin, Activity, Eye, Map, QrCode } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { ProgressRing } from '../../components/common/ProgressRing'
import { StatusBadge } from '../../components/common/StatusBadge'
import { equipmentApi } from '../../api/endpoints'
import { cn } from '../../lib/utils'
import type { EquipmentWithDetails } from '../../types/database'

const categories = ['All','Excavator','Bulldozer','Wheel Loader','Dump Truck','Roller','Crane','Forklift','Generator','Compressor','Water Tanker','Concrete Mixer','Light Tower']
const statuses = ['All','Available','Rented','Maintenance','Transit','Decommissioned']

export default function EquipmentListPage() {
  const [equipment, setEquipment] = useState<EquipmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const navigate = useNavigate()

  useEffect(() => { equipmentApi.getAllWithDetails().then(data => { setEquipment(data); setLoading(false) }) }, [])

  const filtered = equipment.filter(eq => {
    const matchSearch = !search || eq.name.toLowerCase().includes(search.toLowerCase()) || eq.equipment_id.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'All' || eq.equipment_type === categoryFilter
    const matchStatus = statusFilter === 'All' || eq.status_name === statusFilter
    return matchSearch && matchCategory && matchStatus
  })

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-72 rounded-xl"/>)}</div></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="page-header">Equipment Fleet</h1><p className="page-description">{filtered.length} of {equipment.length} equipment units</p></div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode==='grid'?'default':'outline'} size="icon" onClick={()=>setViewMode('grid')} className="h-9 w-9"><Grid3X3 className="h-4 w-4"/></Button>
          <Button variant={viewMode==='list'?'default':'outline'} size="icon" onClick={()=>setViewMode('list')} className="h-9 w-9"><List className="h-4 w-4"/></Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Search equipment..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9"/></div>
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">{categories.map(c=><option key={c}>{c}</option>)}</select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">{statuses.map(s=><option key={s}>{s}</option>)}</select>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((eq, idx) => (
            <motion.div key={eq.equipment_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
              <Card className="overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer" onClick={()=>navigate(`/equipment/${eq.equipment_id}`)}>
                <div className="h-36 bg-gradient-to-br from-navy-800 to-navy-900 relative flex items-center justify-center overflow-hidden">
                  <Truck className="h-16 w-16 text-construction-400/20"/>
                  <div className="absolute top-3 left-3"><StatusBadge status={eq.status_name ?? 'Unknown'}/></div>
                  <div className="absolute top-3 right-3"><ProgressRing value={eq.health} size={40} strokeWidth={3}/></div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent"/>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div><h3 className="font-semibold text-sm leading-tight">{eq.name}</h3><p className="text-[11px] text-muted-foreground mt-0.5">{eq.equipment_id} • {eq.manufacturer}</p></div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{eq.equipment_type}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Fuel className="h-3 w-3"/><span className={cn((eq.fuel_level??0)<30?'text-status-critical':'')}>{eq.fuel_level?.toFixed(0)??'—'}%</span></div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Activity className="h-3 w-3"/><span>{eq.usage_realtime?.status_id===16?'Running':'Idle'}</span></div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3"/><StatusBadge status={eq.maintenance_status??'Healthy'} dot={false} className="text-[10px] px-1.5 py-0"/></div>
                  </div>
                  {eq.current_site && <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3 shrink-0"/><span className="truncate">{eq.current_site.name}</span></div>}
                  {eq.current_operator && <p className="text-[11px] text-muted-foreground">Operator: <span className="text-foreground font-medium">{eq.current_operator.operator_name}</span></p>}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-[11px]" onClick={e=>{e.stopPropagation();navigate(`/equipment/${eq.equipment_id}`)}}><Eye className="h-3 w-3 mr-1"/>Details</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={e=>{e.stopPropagation();navigate('/fleet-map')}}><Map className="h-3 w-3"/></Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={e=>e.stopPropagation()}><QrCode className="h-3 w-3"/></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">{['Equipment','Type','Status','Site','Health','Fuel','Actions'].map(h=><th key={h} className="text-left p-3 font-medium text-muted-foreground text-xs">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(eq=>(
                  <tr key={eq.equipment_id} className="border-b hover:bg-muted/30 cursor-pointer transition-colors" onClick={()=>navigate(`/equipment/${eq.equipment_id}`)}>
                    <td className="p-3"><p className="font-medium text-sm">{eq.name}</p><p className="text-xs text-muted-foreground">{eq.equipment_id}</p></td>
                    <td className="p-3"><Badge variant="outline" className="text-[10px]">{eq.equipment_type}</Badge></td>
                    <td className="p-3"><StatusBadge status={eq.status_name??'Unknown'}/></td>
                    <td className="p-3 text-xs text-muted-foreground">{eq.current_site?.name||'—'}</td>
                    <td className="p-3"><ProgressRing value={eq.health} size={32} strokeWidth={3}/></td>
                    <td className="p-3 text-xs">{eq.fuel_level?.toFixed(0)??'—'}%</td>
                    <td className="p-3"><Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e=>{e.stopPropagation();navigate(`/equipment/${eq.equipment_id}`)}}><Eye className="h-3 w-3"/></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  )
}
