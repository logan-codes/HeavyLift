import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getHealthColor(score: number): string {
  if (score >= 80) return 'text-status-healthy'
  if (score >= 60) return 'text-status-warning'
  return 'text-status-critical'
}

export function getHealthBg(score: number): string {
  if (score >= 80) return 'bg-status-healthy/10 text-status-healthy'
  if (score >= 60) return 'bg-status-warning/10 text-status-warning'
  return 'bg-status-critical/10 text-status-critical'
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    'Active': 'bg-status-healthy/10 text-status-healthy border-status-healthy/20',
    'Available': 'bg-status-healthy/10 text-status-healthy border-status-healthy/20',
    'Rented': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Maintenance': 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance/20',
    'Transit': 'bg-status-warning/10 text-status-warning border-status-warning/20',
    'Completed': 'bg-navy-400/10 text-navy-400 border-navy-400/20',
    'Overdue': 'bg-status-critical/10 text-status-critical border-status-critical/20',
    'Cancelled': 'bg-status-idle/10 text-status-idle border-status-idle/20',
    'Reserved': 'bg-construction-400/10 text-construction-400 border-construction-400/20',
    'Inactive': 'bg-status-idle/10 text-status-idle border-status-idle/20',
    'Idle': 'bg-status-idle/10 text-status-idle border-status-idle/20',
    'Decommissioned': 'bg-red-900/10 text-red-400 border-red-400/20',
    'Healthy': 'bg-status-healthy/10 text-status-healthy border-status-healthy/20',
    'Inspection Due': 'bg-status-warning/10 text-status-warning border-status-warning/20',
    'Maintenance Scheduled': 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance/20',
    'Repair In Progress': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Scheduled': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'In Progress': 'bg-construction-400/10 text-construction-400 border-construction-400/20',
    'On Leave': 'bg-status-warning/10 text-status-warning border-status-warning/20',
  }
  return map[status] || 'bg-status-idle/10 text-status-idle border-status-idle/20'
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    'Critical': 'bg-status-critical/10 text-status-critical border-status-critical/20',
    'High': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Medium': 'bg-status-warning/10 text-status-warning border-status-warning/20',
    'Low': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }
  return map[priority] || 'bg-status-idle/10 text-status-idle'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
