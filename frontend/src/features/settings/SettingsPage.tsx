import { motion } from 'framer-motion'
import { Building2, Users, Shield, Bell, Palette, Globe, Map, Wifi, Brain, Server, Save, Sun, Moon, Monitor } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useTheme } from '../../providers/ThemeProvider'
import { useAuth } from '../../providers/AuthProvider'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="page-header">Settings</h1><p className="page-description">Configure platform preferences and integrations</p></div>

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="api">API Config</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4 space-y-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground mb-1 block">Company Name</label><Input defaultValue="CaterPillar Equipment Corp" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Industry</label><Input defaultValue="Construction & Mining Equipment Rental" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Email</label><Input defaultValue="admin@caterpillar.com" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Phone</label><Input defaultValue="+1-800-555-0100" /></div>
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> User Management</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left p-2 text-xs text-muted-foreground">User</th><th className="text-left p-2 text-xs text-muted-foreground">Email</th><th className="text-left p-2 text-xs text-muted-foreground">Role</th><th className="text-left p-2 text-xs text-muted-foreground">Status</th></tr></thead>
                <tbody>
                  {[
                    { name: 'James Morrison', email: 'admin@caterpillar.com', role: 'Admin', active: true },
                    { name: 'Sarah Chen', email: 'sarah.chen@caterpillar.com', role: 'Manager', active: true },
                    { name: 'Mike Rodriguez', email: 'mike.r@caterpillar.com', role: 'Operator', active: true },
                    { name: 'Emily Watson', email: 'emily.w@caterpillar.com', role: 'Manager', active: true },
                    { name: 'David Park', email: 'david.p@buildcorp.com', role: 'Customer', active: true },
                  ].map(u => (
                    <tr key={u.email} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{u.name}</td>
                      <td className="p-2 text-muted-foreground">{u.email}</td>
                      <td className="p-2"><Badge variant="outline" className="text-[10px]">{u.role}</Badge></td>
                      <td className="p-2"><Badge variant="success" className="text-[10px]">Active</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['Critical Alerts', 'Maintenance Due', 'Rental Expiring', 'Fuel Warnings', 'AI Anomalies', 'Weather Alerts'].map(n => (
                <div key={n} className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm">{n}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded" /> Email</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded" /> Push</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" className="rounded" /> SMS</label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Palette className="h-4 w-4" /> Theme Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {([['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', Monitor, 'System']] as const).map(([val, Icon, label]) => (
                  <button key={val} onClick={() => setTheme(val)} className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${theme === val ? 'border-construction-400 bg-construction-400/10' : 'border-border hover:border-muted-foreground/30'}`}>
                    <Icon className="h-4 w-4" /><span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-4 space-y-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> API Gateway Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">API Gateway URL</label><Input defaultValue="http://localhost:8080" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">WebSocket URL</label><Input defaultValue="ws://localhost:8080/ws" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">API Timeout (ms)</label><Input defaultValue="15000" type="number" /></div>
              <Button className="gap-2"><Save className="h-4 w-4" /> Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Server className="h-4 w-4" /> Service Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Spring Boot API Gateway', url: ':8080', status: 'Online' },
                  { name: 'Usage Tracking Service (Java)', url: ':8081', status: 'Online' },
                  { name: 'Alerting Service (Java)', url: ':8082', status: 'Online' },
                  { name: 'AI Forecasting Service (Python)', url: ':5000', status: 'Online' },
                  { name: 'PostgreSQL Database', url: ':5432', status: 'Online' },
                  { name: 'Kafka Message Broker', url: ':9092', status: 'Online' },
                  { name: 'WebSocket Server', url: ':8080/ws', status: 'Online' },
                ].map(s => (
                  <div key={s.name} className="flex items-center justify-between py-2 border-b border-border/50">
                    <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.url}</p></div>
                    <Badge variant="success" className="text-[10px] gap-1"><span className="h-1.5 w-1.5 rounded-full bg-status-healthy animate-pulse" />{s.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
