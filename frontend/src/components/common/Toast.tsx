import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { LiveEvent } from '../../types/database'

interface Toast {
  id: string
  event: LiveEvent
}

// Global toast manager
let addToastFn: ((event: LiveEvent) => void) | null = null

export function showToast(event: LiveEvent) {
  addToastFn?.(event)
}

const severityConfig = {
  info: { icon: Info, bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-500' },
  success: { icon: CheckCircle2, bg: 'bg-status-healthy/10 border-status-healthy/30', text: 'text-status-healthy' },
  warning: { icon: AlertTriangle, bg: 'bg-status-warning/10 border-status-warning/30', text: 'text-status-warning' },
  critical: { icon: AlertCircle, bg: 'bg-status-critical/10 border-status-critical/30', text: 'text-status-critical' },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((event: LiveEvent) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev.slice(-4), { id, event }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => {
          const severity = toast.event.severity || 'info'
          const config = severityConfig[severity]
          const Icon = config.icon

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={cn('flex items-start gap-3 rounded-lg border p-3 shadow-lg backdrop-blur-xl', config.bg)}
            >
              <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.text)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{toast.event.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{toast.event.equipment_id}</p>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
