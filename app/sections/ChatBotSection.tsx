'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { callAIAgent, AIAgentResponse } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'
import {
  FiSend,
  FiHeart,
  FiAlertTriangle,
  FiWind,
  FiCalendar,
  FiLoader,
  FiPhone,
  FiArrowDown,
} from 'react-icons/fi'

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
  timestamp: number
}

const STARTERS = [
  "I'm feeling anxious today",
  'Help me relax',
  'I need someone to talk to',
  'I had a tough day at work',
]

/* ------------------------------------------------------------------ */
/*  Robust response extractor — handles all nesting/string variants   */
/* ------------------------------------------------------------------ */
function extractAgentData(res: AIAgentResponse): {
  message: string
  emotional_tone?: string
  distress_detected?: boolean
  suggestion?: string
  suggested_action?: string
} {
  const fallback = { message: 'I hear you. Tell me more about how you are feeling.' }

  if (!res.success) {
    const msg =
      res.response?.message ||
      (res.response?.result && typeof res.response.result === 'object'
        ? (res.response.result as Record<string, unknown>).message
        : undefined) ||
      res.error
    return { message: typeof msg === 'string' && msg ? msg : fallback.message }
  }

  let data: any = res.response?.result

  // Fallback: top-level message
  if (!data && res.response?.message) {
    return { message: res.response.message }
  }
  if (!data) return fallback

  // If result is a string, try to JSON-parse it
  if (typeof data === 'string') {
    const trimmed = data.trim()
    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    const toParse = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed

    if (toParse.startsWith('{') || toParse.startsWith('[')) {
      try {
        data = JSON.parse(toParse)
      } catch {
        // Not valid JSON - use the raw string as the message
        return { message: data }
      }
    } else {
      return { message: data }
    }
  }

  // Unwrap nested layers: { result: { ... } } or { response: { ... } }
  if (data.result && typeof data.result === 'object' && !Array.isArray(data.result)) {
    if (data.result.message || data.result.emotional_tone) data = data.result
  }
  if (data.response && typeof data.response === 'object' && !Array.isArray(data.response)) {
    if (data.response.message || data.response.emotional_tone) data = data.response
  }

  // Extract fields safely with multiple key fallbacks
  const message =
    (typeof data.message === 'string' && data.message) ||
    (typeof data.text === 'string' && data.text) ||
    (typeof data.response === 'string' && data.response) ||
    (typeof data.answer === 'string' && data.answer) ||
    (typeof data.content === 'string' && data.content) ||
    fallback.message

  return {
    message,
    emotional_tone: typeof data.emotional_tone === 'string' ? data.emotional_tone : undefined,
    distress_detected: data.distress_detected === true || data.distress_detected === 'true',
    suggestion:
      typeof data.suggestion === 'string' && data.suggestion ? data.suggestion : undefined,
    suggested_action:
      typeof data.suggested_action === 'string' && data.suggested_action
        ? data.suggested_action
        : undefined,
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function ChatBotSection({ onNavigate, setActiveAgentId }: ChatBotSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionIdRef = useRef(
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2)
  )

  /* ---- auto-scroll ---- */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  /* ---- scroll-down button visibility ---- */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distanceFromBottom > 120)
  }, [])

  /* ---- send message ---- */
  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setActiveAgentId(CHAT_AGENT_ID)

    try {
      const res = await callAIAgent(trimmed, CHAT_AGENT_ID, {
        session_id: sessionIdRef.current,
      })

      const extracted = extractAgentData(res)

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: extracted.message,
        emotionalTone: extracted.emotional_tone,
        distressDetected: extracted.distress_detected,
        suggestion: extracted.suggestion,
        suggestedAction: extracted.suggested_action,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: 'I am having trouble connecting right now. Please try again in a moment.',
          timestamp: Date.now(),
        },
      ])
    }

    setLoading(false)
    setActiveAgentId(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  /* ---- tone color helper ---- */
  const toneColor = (tone?: string) => {
    switch (tone) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'neutral':
        return 'bg-slate-100 text-slate-600 border-slate-200'
      case 'concerned':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'distressed':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'crisis':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] relative">
      {/* ---- Messages area ---- */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 scroll-smooth"
      >
        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center shadow-inner">
              <FiHeart className="w-7 h-7 text-accent" />
            </div>
            <div className="text-center px-4">
              <h3 className="text-lg font-semibold text-foreground mb-1.5">Wellness Chat</h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                Your empathetic AI companion is here 24/7. Share what is on your mind and I will
                listen.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-xs px-2">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3.5 py-2.5 text-xs rounded-full bg-white/80 backdrop-blur-[16px] border border-white/[0.18] text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div className="max-w-[85%] sm:max-w-[78%] space-y-1.5">
              {/* Avatar + Name row for assistant */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center flex-shrink-0">
                    <FiHeart size={11} className="text-accent" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">MindEase</span>
                  {msg.emotionalTone && (
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize',
                        toneColor(msg.emotionalTone)
                      )}
                    >
                      {msg.emotionalTone}
                    </span>
                  )}
                </div>
              )}

              {/* Message bubble */}
              <div
                className={cn(
                  'px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-md shadow-primary/10'
                    : 'bg-white/80 backdrop-blur-[16px] border border-white/[0.18] text-foreground shadow-md rounded-2xl rounded-bl-md'
                )}
              >
                {msg.text}
              </div>

              {/* Timestamp */}
              <p
                className={cn(
                  'text-[10px] text-muted-foreground/60 px-1',
                  msg.role === 'user' ? 'text-right' : 'text-left'
                )}
              >
                {formatTime(msg.timestamp)}
              </p>

              {/* Distress Alert Banner */}
              {msg.distressDetected && (
                <Card className="bg-red-50/80 border-red-200/60 rounded-xl overflow-hidden">
                  <CardContent className="py-3 px-4 flex items-start gap-3">
                    <FiAlertTriangle
                      size={16}
                      className="text-destructive flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-destructive font-medium leading-relaxed">
                        If you are in immediate distress or crisis, please reach out for emergency
                        support right away.
                      </p>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => window.open('tel:9152987821')}
                        className="rounded-full text-xs h-7 gap-1.5"
                      >
                        <FiPhone size={11} /> Call iCall Helpline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestion text */}
              {msg.suggestion && msg.role === 'assistant' && !msg.distressDetected && (
                <p className="text-xs text-muted-foreground italic px-1 leading-relaxed">
                  {msg.suggestion}
                </p>
              )}

              {/* Action buttons */}
              {msg.role === 'assistant' &&
                msg.suggestedAction &&
                msg.suggestedAction !== 'none' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggestedAction === 'breathing_exercise' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate('exercises')}
                        className="rounded-full text-xs h-8 gap-1.5 bg-white/60 hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <FiWind size={12} /> Try Breathing Exercise
                      </Button>
                    )}
                    {msg.suggestedAction === 'book_session' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate('booking')}
                        className="rounded-full text-xs h-8 gap-1.5 bg-white/60 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <FiCalendar size={12} /> Book a Session
                      </Button>
                    )}
                    {msg.suggestedAction === 'sos' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => window.open('tel:9152987821')}
                        className="rounded-full text-xs h-8 gap-1.5"
                      >
                        <FiPhone size={12} /> Emergency Support
                      </Button>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center flex-shrink-0">
                <FiHeart size={11} className="text-accent" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-bl-md">
                <div className="flex gap-1.5 items-center h-5">
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">MindEase is typing...</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => scrollToBottom()}
            className="w-8 h-8 rounded-full bg-white/90 shadow-lg border border-white/[0.18] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiArrowDown size={14} />
          </button>
        </div>
      )}

      {/* ---- Input bar ---- */}
      <div className="px-3 sm:px-4 py-3 border-t border-border/50 bg-white/60 backdrop-blur-[16px]">
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? 'Waiting for response...' : 'Type your message...'}
            disabled={loading}
            autoComplete="off"
            className={cn(
              'flex-1 min-h-[44px] px-4 py-3 text-sm rounded-2xl border transition-all duration-200',
              'bg-white/80 border-border/50 placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            size="icon"
            className={cn(
              'rounded-full w-11 h-11 flex-shrink-0 shadow-md transition-all duration-200',
              input.trim() && !loading
                ? 'shadow-primary/25 hover:shadow-primary/40 hover:scale-105'
                : 'opacity-60'
            )}
          >
            {loading ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
          MindEase provides supportive guidance, not medical advice
        </p>
      </div>
    </div>
  )
}
