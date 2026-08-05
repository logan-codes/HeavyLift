import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Truck, Map, BarChart3, FileText, Bell,
  Brain, Bot, Wrench, ClipboardList, Settings, ChevronLeft,
  ChevronRight, Zap,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Equipment', icon: Truck, path: '/equipment' },
  { label: 'Live Fleet Map', icon: Map, path: '/fleet-map' },
  { label: 'Usage Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Rental Management', icon: FileText, path: '/rentals' },
  { label: 'Alerts', icon: Bell, path: '/alerts', badge: true },
  { label: 'Forecasting', icon: Brain, path: '/forecasting' },
  { label: 'AI Insights', icon: Bot, path: '/ai-insights' },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { label: 'Reports', icon: ClipboardList, path: '/reports' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen sticky top-0 flex flex-col border-r border-border bg-card z-30"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border gap-3">
        <div className="w-9 h-9 rounded-lg bg-construction-400 flex items-center justify-center shrink-0">
          <Zap className="h-5 w-5 text-navy-900" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            <h1 className="font-bold text-sm tracking-tight leading-tight">CaterPillar</h1>
            <p className="text-[10px] text-muted-foreground font-medium">Equipment Intelligence</p>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'sidebar-link group relative',
                isActive && 'sidebar-link-active'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-construction-400"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-construction-400' : 'text-muted-foreground group-hover:text-foreground')} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto h-5 w-5 rounded-full bg-status-critical text-[10px] text-white flex items-center justify-center font-bold">
                  3
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-link w-full justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}
