'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { callAIAgent } from '@/lib/aiAgent'
import { FiMessageCircle, FiStar, FiSend, FiX, FiLoader, FiVideo, FiPhone, FiMessageSquare, FiShield, FiCheck, FiClock } from 'react-icons/fi'

interface BookingSectionProps {
  setActiveAgentId: (id: string | null) => void
}

const BOOKING_AGENT_ID = '69a280267feec6663e53da98'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Video Call', icon: FiVideo },
  { id: 'audio', label: 'Audio Call', icon: FiPhone },
  { id: 'chat', label: 'Chat', icon: FiMessageSquare },
  { id: 'anonymous', label: 'Anonymous', icon: FiShield },
]

interface Psychologist {
  id: string
  name: string
  initials: string
  specialization: string
  experience: string
  rating: number
  availability: string
  sessionTypes: string[]
  bgColor: string
}

const psychologists: Psychologist[] = [
  { id: '1', name: 'Dr. Priya Sharma', initials: 'PS', specialization: 'Anxiety & Stress', experience: '12 years', rating: 4.9, availability: 'Available Today', sessionTypes: ['video', 'audio', 'chat'], bgColor: 'bg-primary/20' },
  { id: '2', name: 'Dr. Arjun Mehta', initials: 'AM', specialization: 'Depression & CBT', experience: '8 years', rating: 4.8, availability: 'Next Available: Tomorrow', sessionTypes: ['video', 'audio'], bgColor: 'bg-accent/20' },
  { id: '3', name: 'Dr. Lakshmi Nair', initials: 'LN', specialization: 'Relationship Counseling', experience: '15 years', rating: 4.9, availability: 'Available Today', sessionTypes: ['video', 'chat', 'anonymous'], bgColor: 'bg-purple-500/20' },
  { id: '4', name: 'Dr. Rohit Kapoor', initials: 'RK', specialization: 'Work-Life Balance', experience: '6 years', rating: 4.7, availability: 'Available Today', sessionTypes: ['audio', 'chat', 'anonymous'], bgColor: 'bg-blue-500/20' },
  { id: '5', name: 'Dr. Ananya Das', initials: 'AD', specialization: 'Trauma & PTSD', experience: '10 years', rating: 4.8, availability: 'Next Available: Wednesday', sessionTypes: ['video', 'audio', 'anonymous'], bgColor: 'bg-rose-500/20' },
  { id: '6', name: 'Dr. Vikram Singh', initials: 'VS', specialization: 'Mindfulness & Meditation', experience: '9 years', rating: 4.6, availability: 'Available Today', sessionTypes: ['video', 'chat'], bgColor: 'bg-green-500/20' },
]

interface AssistantMsg {
  id: string
  role: 'user' | 'assistant'
  text: string
  recommendedType?: string
  recommendedSpec?: string
  actionSuggestion?: string
}

interface BookingFlow {
  psychologist: Psychologist
  step: 'type' | 'time' | 'payment' | 'confirmed'
  sessionType: string
  timeSlot: string
}

const timeSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM']

export default function BookingSection({ setActiveAgentId }: BookingSectionProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantMsgs, setAssistantMsgs] = useState<AssistantMsg[]>([])
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [booking, setBooking] = useState<BookingFlow | null>(null)
  const assistantScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (assistantScrollRef.current) {
      assistantScrollRef.current.scrollTop = assistantScrollRef.current.scrollHeight
    }
  }, [assistantMsgs, assistantLoading])

  const filtered = activeFilter === 'all'
    ? psychologists
    : psychologists.filter(p => p.sessionTypes.includes(activeFilter))

  const sendAssistantMsg = async (text: string) => {
    if (!text.trim() || assistantLoading) return
    const userMsg: AssistantMsg = { id: Date.now().toString(), role: 'user', text: text.trim() }
    setAssistantMsgs(prev => [...prev, userMsg])
    setAssistantInput('')
    setAssistantLoading(true)
    setActiveAgentId(BOOKING_AGENT_ID)

    try {
      const res = await callAIAgent(text.trim(), BOOKING_AGENT_ID)
      if (res.success && res.response?.result) {
        let parsed = res.response.result
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed) } catch { parsed = { message: parsed } }
        }
        const data = parsed as Record<string, unknown>
        setAssistantMsgs(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: typeof data?.message === 'string' ? data.message : 'Let me help you find the right fit.',
          recommendedType: typeof data?.recommended_session_type === 'string' ? data.recommended_session_type : undefined,
          recommendedSpec: typeof data?.recommended_specialization === 'string' ? data.recommended_specialization : undefined,
          actionSuggestion: typeof data?.action_suggestion === 'string' ? data.action_suggestion : undefined,
        }])
      } else {
        setAssistantMsgs(prev => [...prev, {
          id: (Date.now() + 1).toString(), role: 'assistant',
          text: 'I can help you find the right psychologist. Could you tell me more about what you are looking for?',
        }])
      }
    } catch {
      setAssistantMsgs(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        text: 'Connection issue. Please try again shortly.',
      }])
    }
    setAssistantLoading(false)
    setActiveAgentId(null)
  }

  const handleAssistantKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendAssistantMsg(assistantInput)
    }
  }

  const startBooking = (p: Psychologist) => {
    setBooking({ psychologist: p, step: 'type', sessionType: '', timeSlot: '' })
  }

  const renderStars = (rating: number) => {
    const full = Math.floor(rating)
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <FiStar key={i} size={12} className="fill-yellow-400 text-yellow-400" />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating}</span>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      <ScrollArea className="h-full">
        <div className="px-4 py-6 pb-24 space-y-4">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-foreground">Find a Psychologist</h2>
            <p className="text-sm text-muted-foreground">Connect with certified professionals</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeFilter === f.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-white/75 backdrop-blur-[16px] border border-white/[0.18] text-foreground hover:border-primary/40'}`}
              >
                {f.icon && <f.icon size={12} />}
                {f.label}
              </button>
            ))}
          </div>

          {/* Psychologist cards */}
          <div className="space-y-3">
            {filtered.map(p => (
              <Card key={p.id} className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-2xl">
                <CardContent className="py-4">
                  <div className="flex gap-3">
                    <div className={`w-14 h-14 rounded-2xl ${p.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-sm font-bold text-foreground">{p.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.specialization}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {renderStars(p.rating)}
                        <span className="text-xs text-muted-foreground">{p.experience}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={p.availability.includes('Today') ? 'default' : 'secondary'} className="text-[10px] rounded-full">
                          {p.availability}
                        </Badge>
                        <Button size="sm" onClick={() => startBooking(p)} className="rounded-full text-xs h-7 px-3">
                          Book Now
                        </Button>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {p.sessionTypes.map(t => (
                          <Badge key={t} variant="outline" className="text-[9px] rounded-full capitalize">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Ask Assistant FAB */}
      <button
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-24 right-20 z-40 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-accent/30 transition-transform hover:scale-110 active:scale-95"
        aria-label="Ask Assistant"
      >
        <FiMessageCircle size={20} />
      </button>

      {/* Assistant Dialog */}
      <Dialog open={assistantOpen} onOpenChange={setAssistantOpen}>
        <DialogContent className="max-w-sm rounded-2xl bg-white/95 backdrop-blur-[16px] border border-white/[0.18] p-0 max-h-[70vh] flex flex-col">
          <DialogHeader className="p-4 pb-2 border-b border-border">
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                <FiMessageCircle size={12} className="text-accent" />
              </div>
              Booking Assistant
            </DialogTitle>
          </DialogHeader>
          <div ref={assistantScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {assistantMsgs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Ask me anything about booking a session, choosing a psychologist, or session types.
              </p>
            )}
            {assistantMsgs.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-foreground rounded-bl-md'}`}>
                  {msg.text}
                  {msg.recommendedType && msg.recommendedType !== 'none' && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-[9px] rounded-full capitalize">Recommended: {msg.recommendedType}</Badge>
                    </div>
                  )}
                  {msg.recommendedSpec && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-[9px] rounded-full">Specialist: {msg.recommendedSpec}</Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {assistantLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-secondary rounded-bl-md">
                  <div className="flex gap-1 items-center h-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              onKeyDown={handleAssistantKeyDown}
              placeholder="Ask about sessions..."
              className="rounded-full text-xs h-8"
              disabled={assistantLoading}
            />
            <Button size="icon" onClick={() => sendAssistantMsg(assistantInput)} disabled={!assistantInput.trim() || assistantLoading} className="rounded-full w-8 h-8 flex-shrink-0">
              {assistantLoading ? <FiLoader className="animate-spin" size={12} /> : <FiSend size={12} />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Flow Dialog */}
      <Dialog open={!!booking} onOpenChange={(v) => { if (!v) setBooking(null) }}>
        <DialogContent className="max-w-sm rounded-2xl bg-white/95 backdrop-blur-[16px] border border-white/[0.18]">
          {booking && booking.step === 'type' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Select Session Type</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground mb-3">Booking with {booking.psychologist.name}</p>
              <div className="grid grid-cols-2 gap-2">
                {booking.psychologist.sessionTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setBooking(prev => prev ? { ...prev, sessionType: t, step: 'time' } : null)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all text-sm capitalize border border-transparent hover:border-primary"
                  >
                    {t === 'video' && <FiVideo size={20} />}
                    {t === 'audio' && <FiPhone size={20} />}
                    {t === 'chat' && <FiMessageSquare size={20} />}
                    {t === 'anonymous' && <FiShield size={20} />}
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}

          {booking && booking.step === 'time' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Select Time Slot</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground mb-3">
                {booking.psychologist.name} - <span className="capitalize">{booking.sessionType}</span> session
              </p>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setBooking(prev => prev ? { ...prev, timeSlot: slot, step: 'payment' } : null)}
                    className="px-3 py-2.5 rounded-xl bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all text-xs font-medium border border-transparent hover:border-primary flex items-center gap-1 justify-center"
                  >
                    <FiClock size={10} />
                    {slot}
                  </button>
                ))}
              </div>
            </>
          )}

          {booking && booking.step === 'payment' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Payment Summary</DialogTitle>
              </DialogHeader>
              <Card className="bg-secondary/30 rounded-xl">
                <CardContent className="py-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Psychologist</span><span className="font-medium">{booking.psychologist.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Session</span><span className="font-medium capitalize">{booking.sessionType}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{booking.timeSlot}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total</span><span className="font-bold text-primary">Rs. 999</span></div>
                </CardContent>
              </Card>
              <div className="space-y-2 mt-2">
                <p className="text-xs font-medium text-foreground">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {['UPI', 'Card', 'Netbanking', 'Wallet'].map(m => (
                    <button key={m} className="px-3 py-2 rounded-xl bg-secondary/50 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-all border border-transparent hover:border-primary">
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={() => setBooking(prev => prev ? { ...prev, step: 'confirmed' } : null)} className="w-full rounded-xl mt-2 shadow-md shadow-primary/20">
                Pay & Confirm
              </Button>
            </>
          )}

          {booking && booking.step === 'confirmed' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <FiCheck className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Booking Confirmed!</h3>
              <Card className="bg-secondary/30 rounded-xl">
                <CardContent className="py-3 space-y-1.5 text-sm text-left">
                  <p><span className="text-muted-foreground">Doctor: </span><span className="font-medium">{booking.psychologist.name}</span></p>
                  <p><span className="text-muted-foreground">Type: </span><span className="font-medium capitalize">{booking.sessionType}</span></p>
                  <p><span className="text-muted-foreground">Time: </span><span className="font-medium">{booking.timeSlot}</span></p>
                  <p><span className="text-muted-foreground">Amount: </span><span className="font-medium text-primary">Rs. 999</span></p>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">You will receive a confirmation message with the meeting link shortly.</p>
              <Button onClick={() => setBooking(null)} className="rounded-xl">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
