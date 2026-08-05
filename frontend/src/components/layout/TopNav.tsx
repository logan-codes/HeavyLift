import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Bell, Sun, Moon, LogOut, User, Settings, Activity,
  MessageSquare, ChevronDown,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useTheme } from '../../providers/ThemeProvider'
import { useAuth } from '../../providers/AuthProvider'
import { cn } from '../../lib/utils'

export function TopNav() {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment, sites, operators..."
            className="pl-9 bg-muted/50 border-transparent focus:border-border h-9"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          />
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-2 text-sm">
              <p className="text-muted-foreground px-2 py-1 text-xs font-medium">Quick Actions</p>
              <button className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent text-sm flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                View Dashboard
              </button>
              <button className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent text-sm flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                Find Equipment...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* System Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-xs">
          <span className="h-2 w-2 rounded-full bg-status-healthy animate-pulse" />
          <span className="text-muted-foreground font-medium">All Systems Online</span>
        </div>

        {/* MQ Status */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-xs">
          <MessageSquare className="h-3 w-3 text-status-healthy" />
          <span className="text-muted-foreground font-medium">Kafka: <span className="text-status-healthy">Connected</span></span>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9"
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => navigate('/alerts')}>
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-status-critical text-[9px] text-white flex items-center justify-center font-bold">
            5
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold',
                'bg-construction-400 text-navy-900'
              )}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium leading-tight">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{user?.role.role_name}</p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate('/login') }} className="text-status-critical focus:text-status-critical">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
