import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Brain, Truck, BarChart3, Lightbulb, Loader2 } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { ScrollArea } from '../../components/ui/scroll-area'
import { ProgressRing } from '../../components/common/ProgressRing'
import { cn } from '../../lib/utils'
import type { AIInsightMessage } from '../../types/database'

const cannedResponses: Record<string, Omit<AIInsightMessage, 'id' | 'role' | 'timestamp'>> = {
  'idle': {
    content: 'I found **4 machines** currently idle across your fleet:\n\n• **EQ-007** Liebherr Crane — idle 3.5h at Bay Area Tech Campus\n• **EQ-019** Tadano Crane — idle 4.2h at Westside Mall\n• **EQ-004** Volvo Wheel Loader — idle 2.4h at Downtown Tower\n• **EQ-012** Putzmeister Mixer — idle at Downtown Tower\n\n**Recommendation:** Consider reassigning EQ-007 to Houston where crane demand is high.',
    confidence: 94, reasoning: 'Based on UsageRealtime status_id=15 (Idle) and current site assignments',
    related_equipment: ['EQ-007', 'EQ-019', 'EQ-004', 'EQ-012'],
    suggested_actions: ['Reassign EQ-007 to Houston', 'Contact operators for status', 'Review site schedules'],
  },
  'fail': {
    content: 'Based on health scores and anomaly patterns, these machines have the **highest failure risk**:\n\n1. **EQ-015** John Deere 850K — Health: 32%, Engine overhaul in progress\n2. **EQ-023** Doosan DL550-5 — Health: 35%, Transmission repair ongoing\n3. **EQ-006** Hamm Roller — Health: 45%, Overheating alerts active\n4. **EQ-003** CAT D6T — Health: 58%, Fuel anomaly detected\n\n⚠️ EQ-006 is the most urgent — operating in Phoenix heat with temperature exceeding thresholds.',
    confidence: 89, reasoning: 'Computed from equipment.health scores, active alerts, and usage patterns',
    related_equipment: ['EQ-015', 'EQ-023', 'EQ-006', 'EQ-003'],
    suggested_actions: ['Immediate shutdown of EQ-006', 'Expedite parts for EQ-023', 'Schedule EQ-003 inspection'],
  },
  'excavator': {
    content: 'For tomorrow\'s operations, I recommend assigning **EQ-014 Hitachi ZX350LC** to the Downtown Tower Project:\n\n• **Status:** Available\n• **Health:** 79% — Good condition\n• **Last Maintenance:** July 20 — Recent service\n• **Why:** EQ-001 (current excavator at site) has 4520+ engine hours. Rotating would reduce wear.\n\nAlternatively, **EQ-016 Komatsu WA380** is available if you need a wheel loader instead.',
    confidence: 87, reasoning: 'Matching available equipment to site demand forecasts and health scores',
    related_equipment: ['EQ-014', 'EQ-016', 'EQ-001'],
    suggested_actions: ['Reserve EQ-014 for tomorrow', 'Pre-inspect EQ-014', 'Notify site supervisor'],
  },
  'utilization': {
    content: 'Fleet utilization has been **declining 3.2% week-over-week** for the past 3 weeks.\n\n**Key drivers:**\n1. **2 machines in maintenance** (EQ-015, EQ-023) — reducing available fleet by 7%\n2. **3 idle machines** not being reassigned efficiently\n3. **Phoenix site** has 2 units near capacity while **Boulder** is underutilized\n\n**Projected impact:** If trend continues, August revenue will be ~$42K below target.\n\n**Fix:** Relocate 1 unit from Boulder to Phoenix. Return EQ-015 from maintenance by Aug 10.',
    confidence: 82, reasoning: 'Analysis of utilization trends, site-level demand, and maintenance schedules',
    related_equipment: ['EQ-015', 'EQ-023'],
    suggested_actions: ['Relocate Boulder → Phoenix', 'Expedite EQ-015 repair', 'Review site allocation'],
  },
  'default': {
    content: 'I can help you with fleet intelligence queries. Here are some things you can ask:\n\n• "Show idle machines"\n• "Predict failures"\n• "Which excavator should be assigned tomorrow?"\n• "Why is utilization dropping?"\n• "Find low utilization assets"\n• "Suggest equipment relocation"\n\nI analyze data from your Usage Tracking, Alerting, and Forecasting services to provide actionable recommendations.',
    confidence: 100, reasoning: 'General capability overview',
    related_equipment: [],
    suggested_actions: ['Try asking about idle machines', 'Check failure predictions', 'Review utilization trends'],
  },
}

function matchResponse(query: string): Omit<AIInsightMessage, 'id' | 'role' | 'timestamp'> {
  const q = query.toLowerCase()
  if (q.includes('idle') || q.includes('unused')) return cannedResponses['idle']
  if (q.includes('fail') || q.includes('risk') || q.includes('break')) return cannedResponses['fail']
  if (q.includes('excavator') || q.includes('assign') || q.includes('tomorrow')) return cannedResponses['excavator']
  if (q.includes('utilization') || q.includes('dropping') || q.includes('declining') || q.includes('low')) return cannedResponses['utilization']
  return cannedResponses['default']
}

const suggestedQuestions = [
  'Which excavator should be assigned tomorrow?',
  'Show idle machines',
  'Predict failures',
  'Why is utilization dropping?',
]

export default function AIInsightsPage() {
  const [messages, setMessages] = useState<AIInsightMessage[]>([{
    id: '0', role: 'assistant', content: 'Hello! I\'m your **AI Fleet Intelligence Assistant**. I analyze real-time data from your equipment fleet to provide actionable insights.\n\nHow can I help you today?',
    timestamp: new Date().toISOString(), confidence: 100,
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: AIInsightMessage = { id: Math.random().toString(36).substring(2), role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))

    const response = matchResponse(text)
    const aiMsg: AIInsightMessage = { id: Math.random().toString(36).substring(2), role: 'assistant', timestamp: new Date().toISOString(), ...response }
    setMessages(prev => [...prev, aiMsg])
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div><h1 className="page-header">AI Insights Assistant</h1><p className="page-description">Powered by AI Forecasting & Anomaly Detection Service</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Chat */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
              <AnimatePresence>
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', msg.role === 'assistant' ? 'bg-status-maintenance/10' : 'bg-construction-400')}>
                      {msg.role === 'assistant' ? <Bot className="h-4 w-4 text-status-maintenance" /> : <User className="h-4 w-4 text-navy-900" />}
                    </div>
                    <div className={cn('max-w-[80%] rounded-2xl p-4', msg.role === 'assistant' ? 'bg-muted/50 rounded-tl-sm' : 'bg-construction-400/10 rounded-tr-sm')}>
                      <div className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                      {msg.confidence && msg.role === 'assistant' && msg.confidence < 100 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <ProgressRing value={msg.confidence} size={28} strokeWidth={3} color="#8B5CF6" />
                            <span className="text-xs font-medium">{msg.confidence}% confidence</span>
                          </div>
                          {msg.reasoning && <p className="text-[11px] text-muted-foreground mb-2">💡 {msg.reasoning}</p>}
                          {msg.related_equipment && msg.related_equipment.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {msg.related_equipment.map(e => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
                            </div>
                          )}
                          {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                            <div className="space-y-1">
                              {msg.suggested_actions.map((a, i) => (
                                <button key={i} className="block w-full text-left text-xs px-2 py-1 rounded bg-background hover:bg-accent transition-colors">▸ {a}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-status-maintenance/10 flex items-center justify-center"><Bot className="h-4 w-4 text-status-maintenance" /></div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-status-maintenance" /><span className="text-sm text-muted-foreground">Analyzing fleet data...</span></div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <form onSubmit={e => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your fleet..." className="flex-1" disabled={loading} />
              <Button type="submit" disabled={loading || !input.trim()} className="gap-2"><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </Card>

        {/* Sidebar */}
        <Card className="p-4 space-y-4 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Questions</p>
            <div className="space-y-1.5">
              {suggestedQuestions.map(q => (
                <button key={q} onClick={() => sendMessage(q)} className="w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Lightbulb className="h-3 w-3 inline mr-1.5 text-construction-400" />{q}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Service Status</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Forecasting</span><Badge variant="success" className="text-[9px]">Online</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Anomaly Detection</span><Badge variant="success" className="text-[9px]">Online</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Model Version</span><span>v2.4.1</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Training</span><span>Aug 3, 2026</span></div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
