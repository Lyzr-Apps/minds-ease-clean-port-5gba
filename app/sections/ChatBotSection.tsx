'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { callAIAgent } from '@/lib/aiAgent'
import { FiSend, FiHeart, FiAlertTriangle, FiWind, FiCalendar, FiLoader } from 'react-icons/fi'

interface ChatBotSectionProps {
  onNavigate: (screen: string) => void
  setActiveAgentId: (id: string | null) => void
}

const CHAT_AGENT_ID = '69a28026ad98307a3fb2793b'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  emotionalTone?: string
  distressDetected?: boolean
  suggestion?: string
  suggestedAction?: string
}

const STARTERS = [
  "I'm feeling anxious today",
  "Help me relax",
  "I need someone to talk to",
  "I had a tough day at work",
]

export default function ChatBotSection({ onNavigate, setActiveAgentId }: ChatBotSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef(Date.now().toString(36) + Math.random().toString(36).slice(2))

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setActiveAgentId(CHAT_AGENT_ID)

    try {
      const res = await callAIAgent(text.trim(), CHAT_AGENT_ID, { session_id: sessionIdRef.current })

      if (res.success && res.response?.result) {
        let parsed = res.response.result
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed) } catch { parsed = { message: parsed } }
        }

        const data = parsed as Record<string, unknown>
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: (typeof data?.message === 'string' ? data.message : '') || 'I hear you. Let me know how I can help.',
          emotionalTone: typeof data?.emotional_tone === 'string' ? data.emotional_tone : undefined,
          distressDetected: typeof data?.distress_detected === 'boolean' ? data.distress_detected : false,
          suggestion: typeof data?.suggestion === 'string' ? data.suggestion : undefined,
          suggestedAction: typeof data?.suggested_action === 'string' ? data.suggested_action : undefined,
        }
        setMessages(prev => [...prev, assistantMsg])
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'I am here for you. Could you try sharing that again?',
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Connection issue. Please try again in a moment.',
      }])
    }

    setLoading(false)
    setActiveAgentId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <FiHeart className="w-8 h-8 text-accent" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">Wellness Chat</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your empathetic AI companion is here. Share what is on your mind.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 text-xs rounded-full bg-white/75 backdrop-blur-[16px] border border-white/[0.18] text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] space-y-2`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <FiHeart size={12} className="text-accent" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">MindEase</span>
                  {msg.emotionalTone && (
                    <Badge variant="outline" className="text-[10px] rounded-full capitalize">{msg.emotionalTone}</Badge>
                  )}
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-white/75 backdrop-blur-[16px] border border-white/[0.18] text-foreground shadow-md rounded-bl-md'}`}>
                {msg.text}
              </div>

              {/* Distress Alert */}
              {msg.distressDetected && (
                <Card className="bg-destructive/5 border-destructive/20 rounded-xl">
                  <CardContent className="py-3 flex items-center gap-2">
                    <FiAlertTriangle size={14} className="text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive font-medium">
                      If you are in crisis, please reach out to emergency support.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Suggestion text */}
              {msg.suggestion && msg.role === 'assistant' && (
                <p className="text-xs text-muted-foreground italic px-1">{msg.suggestion}</p>
              )}

              {/* Action buttons */}
              {msg.suggestedAction === 'breathing_exercise' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate('exercises')}
                  className="rounded-full text-xs h-8"
                >
                  <FiWind className="mr-1" size={12} /> Try Breathing Exercise
                </Button>
              )}
              {msg.suggestedAction === 'book_session' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate('booking')}
                  className="rounded-full text-xs h-8"
                >
                  <FiCalendar className="mr-1" size={12} /> Book a Session
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                <FiHeart size={12} className="text-accent" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-bl-md">
                <div className="flex gap-1.5 items-center h-4">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-border bg-white/50 backdrop-blur-[16px]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
            className="rounded-full bg-white/75 border-border"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            size="icon"
            className="rounded-full w-10 h-10 flex-shrink-0 shadow-md shadow-primary/20"
          >
            {loading ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
