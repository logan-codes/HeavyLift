import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Truck, Fuel, MapPin, User, Activity, Eye, Bell, Navigation, Layers, Search } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ProgressRing } from '../../components/common/ProgressRing'
import { StatusBadge } from '../../components/common/StatusBadge'
import { equipmentApi } from '../../api/endpoints'
import { cn } from '../../lib/utils'
import type { EquipmentWithDetails } from '../../types/database'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons for leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createEquipmentIcon(health: number, isRunning: boolean) {
  const color = health >= 80 ? '#10B981' : health >= 50 ? '#F59E0B' : '#EF4444'
  const pulse = isRunning ? `<div style="position:absolute;top:-4px;left:-4px;width:32px;height:32px;border-radius:50%;background:${color};opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ''
  return L.divIcon({
    html: `<div style="position:relative;width:24px;height:24px">${pulse}<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export default function FleetMapPage() {
  const [equipment, setEquipment] = useState<EquipmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    equipmentApi.getAllWithDetails().then(data => { setEquipment(data.filter(e => e.status_id !== 7)); setLoading(false) })
  }, [])

  const filtered = equipment.filter(eq => {
    const matchSearch = !search || eq.name.toLowerCase().includes(search.toLowerCase())
    const matchType = selectedType === 'All' || eq.equipment_type === selectedType
    return matchSearch && matchType
  })

  const types = ['All', ...new Set(equipment.map(e => e.equipment_type).filter(Boolean))]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Live Fleet Map</h1><p className="page-description">{filtered.length} equipment tracked in real-time</p></div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <Card className="overflow-hidden rounded-xl" style={{ height: 'calc(100vh - 260px)' }}>
        {!loading && (
          <MapContainer center={[35.5, -100]} zoom={4} style={{ height: '100%', width: '100%' }} zoomControl={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map(eq => (
              <Marker
                key={eq.equipment_id}
                position={[eq.latitude, eq.longitude]}
                icon={createEquipmentIcon(eq.health, eq.usage_realtime?.status_id === 16)}
              >
                <Popup maxWidth={320} className="equipment-popup">
                  <div className="p-1 min-w-[280px]">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-navy-100 dark:bg-navy-800 flex items-center justify-center shrink-0">
                        <Truck className="h-6 w-6 text-construction-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{eq.name}</p>
                        <p className="text-xs text-gray-500">{eq.equipment_id} • {eq.equipment_type}</p>
                      </div>
                      <ProgressRing value={eq.health} size={36} strokeWidth={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="flex items-center gap-1"><User className="h-3 w-3 text-gray-400" /><span>{eq.current_operator?.operator_name ?? 'Unassigned'}</span></div>
                      <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400" /><span>{eq.current_site?.name ?? 'Depot'}</span></div>
                      <div className="flex items-center gap-1"><Fuel className="h-3 w-3 text-gray-400" /><span>{eq.fuel_level?.toFixed(0)}%</span></div>
                      <div className="flex items-center gap-1"><Activity className="h-3 w-3 text-gray-400" /><span>{eq.usage_realtime?.status_id === 16 ? 'Running' : 'Idle'}</span></div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => navigate(`/equipment/${eq.equipment_id}`)} className="flex-1 bg-construction-400 text-navy-900 rounded px-2 py-1 text-xs font-medium hover:bg-construction-300 flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" /> Details
                      </button>
                      <button className="bg-gray-100 dark:bg-navy-700 rounded px-2 py-1 text-xs font-medium hover:bg-gray-200 flex items-center justify-center gap-1">
                        <Bell className="h-3 w-3" /> Alert
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </Card>
    </motion.div>
  )
}
