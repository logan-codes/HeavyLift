import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../providers/AuthProvider'

export default function LoginPage() {
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || 'admin@caterpillar.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const success = await login({ email, password, remember_me: rememberMe })
      if (success) {
        navigate('/')
      } else {
        setError('Invalid email or account inactive. Try admin@caterpillar.com')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-navy-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-navy-900 via-navy-950 to-black" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-construction-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Left — Brand */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 p-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-construction-400 flex items-center justify-center">
              <Zap className="h-7 w-7 text-navy-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CaterPillar</h1>
              <p className="text-sm text-navy-400">Equipment Intelligence Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Smart Rental Equipment
            <span className="text-construction-400"> Intelligence</span>
          </h2>
          <p className="text-navy-300 text-lg leading-relaxed mb-8">
            Real-time fleet tracking, AI-powered predictive maintenance, and operational intelligence for construction and mining equipment.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Equipment Tracked', value: '29' },
              { label: 'Active Rentals', value: '22' },
              { label: 'Sites Monitored', value: '10' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-construction-400">{stat.value}</p>
                <p className="text-xs text-navy-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Construction illustration — SVG */}
          <div className="mt-12 relative">
            <svg viewBox="0 0 600 200" className="w-full opacity-20">
              {/* Skyline */}
              <rect x="20" y="80" width="40" height="120" fill="#F4B400" rx="2" />
              <rect x="70" y="40" width="50" height="160" fill="#F4B400" rx="2" />
              <rect x="130" y="100" width="35" height="100" fill="#F4B400" rx="2" />
              {/* Crane */}
              <line x1="200" y1="200" x2="200" y2="20" stroke="#F4B400" strokeWidth="4" />
              <line x1="200" y1="20" x2="350" y2="20" stroke="#F4B400" strokeWidth="3" />
              <line x1="350" y1="20" x2="350" y2="60" stroke="#F4B400" strokeWidth="2" />
              <line x1="200" y1="20" x2="160" y2="20" stroke="#F4B400" strokeWidth="3" />
              {/* Excavator */}
              <rect x="400" y="150" width="80" height="40" fill="#F4B400" rx="4" />
              <rect x="420" y="130" width="40" height="20" fill="#F4B400" rx="2" />
              <line x1="460" y1="130" x2="520" y2="80" stroke="#F4B400" strokeWidth="6" strokeLinecap="round" />
              <line x1="520" y1="80" x2="560" y2="120" stroke="#F4B400" strokeWidth="5" strokeLinecap="round" />
              {/* Ground */}
              <line x1="0" y1="200" x2="600" y2="200" stroke="#F4B400" strokeWidth="2" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-navy-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl bg-construction-400 flex items-center justify-center">
                <Zap className="h-6 w-6 text-navy-900" />
              </div>
              <h1 className="text-xl font-bold text-white">CaterPillar</h1>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Welcome back</h3>
            <p className="text-sm text-navy-400 mb-6">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-navy-300 mb-1.5 block">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@caterpillar.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-navy-500 focus:border-construction-400 h-10"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-navy-300 mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-navy-500 focus:border-construction-400 h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-construction-400 focus:ring-construction-400"
                  />
                  <span className="text-xs text-navy-400">Remember me</span>
                </label>
                <button type="button" className="text-xs text-construction-400 hover:text-construction-300 transition-colors">
                  Forgot Password?
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-status-critical bg-status-critical/10 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-construction-400 text-navy-900 hover:bg-construction-300 font-semibold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-[10px] text-navy-500 uppercase tracking-wider font-medium mb-2">Demo Accounts</p>
              <div className="space-y-1">
                {[
                  { email: 'admin@caterpillar.com', role: 'Admin' },
                  { email: 'sarah.chen@caterpillar.com', role: 'Manager' },
                  { email: 'mike.r@caterpillar.com', role: 'Operator' },
                ].map(account => (
                  <button
                    key={account.email}
                    onClick={() => setEmail(account.email)}
                    className="w-full text-left px-2 py-1 rounded text-xs text-navy-400 hover:text-white hover:bg-white/5 transition-colors flex justify-between"
                  >
                    <span>{account.email}</span>
                    <span className="text-navy-500">{account.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-navy-600 mt-4">
            © 2026 CaterPillar Intelligence Platform. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
