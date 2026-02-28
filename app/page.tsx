'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { FiHome, FiActivity, FiMessageCircle, FiWind, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi'

import WelcomeSection from './sections/WelcomeSection'
import DashboardSection from './sections/DashboardSection'
import MoodTrackerSection from './sections/MoodTrackerSection'
import ChatBotSection from './sections/ChatBotSection'
import ExercisesSection from './sections/ExercisesSection'
import BookingSection from './sections/BookingSection'
import SOSButton from './sections/SOSButton'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

type Screen = 'welcome' | 'dashboard' | 'mood' | 'chat' | 'exercises' | 'booking'

const AGENTS = [
  { id: '69a28026ad98307a3fb27939', name: 'Mood Analysis', purpose: 'Analyzes mood questionnaire responses' },
  { id: '69a28026ad98307a3fb2793b', name: 'Wellness Chatbot', purpose: 'Empathetic AI support companion' },
  { id: '69a280267feec6663e53da98', name: 'Booking Assistant', purpose: 'Guides psychologist booking' },
]

const navItems: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Home', icon: FiHome },
  { id: 'mood', label: 'Mood', icon: FiActivity },
  { id: 'chat', label: 'Chat', icon: FiMessageCircle },
  { id: 'exercises', label: 'Exercises', icon: FiWind },
  { id: 'booking', label: 'Booking', icon: FiCalendar },
]

const GRADIENT_BG = 'linear-gradient(135deg, hsl(220, 60%, 95%) 0%, hsl(250, 50%, 94%) 35%, hsl(200, 55%, 94%) 70%, hsl(180, 45%, 93%) 100%)'

export default function Page() {
  const [activeScreen, setActiveScreen] = useState<Screen>('welcome')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [agentInfoOpen, setAgentInfoOpen] = useState(false)

  const navigate = (screen: string) => {
    setActiveScreen(screen as Screen)
  }

  const isWelcome = activeScreen === 'welcome'

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-background text-foreground font-sans"
        style={{ background: GRADIENT_BG }}
      >
        <div className="max-w-md mx-auto relative min-h-screen">
          {/* Screen header for non-welcome, non-dashboard screens */}
          {!isWelcome && activeScreen !== 'dashboard' && (
            <div className="sticky top-0 z-30 px-4 py-3 bg-white/60 backdrop-blur-[16px] border-b border-white/[0.18]">
              <h1 className="text-base font-semibold text-foreground text-center">
                {activeScreen === 'mood' && 'Mood Check'}
                {activeScreen === 'chat' && 'Wellness Chat'}
                {activeScreen === 'exercises' && 'Exercises'}
                {activeScreen === 'booking' && 'Book a Session'}
              </h1>
            </div>
          )}

          {/* Screen rendering */}
          {activeScreen === 'welcome' && (
            <WelcomeSection onGetStarted={() => navigate('dashboard')} />
          )}
          {activeScreen === 'dashboard' && (
            <DashboardSection onNavigate={navigate} />
          )}
          {activeScreen === 'mood' && (
            <MoodTrackerSection onNavigate={navigate} setActiveAgentId={setActiveAgentId} />
          )}
          {activeScreen === 'chat' && (
            <ChatBotSection onNavigate={navigate} setActiveAgentId={setActiveAgentId} />
          )}
          {activeScreen === 'exercises' && (
            <ExercisesSection />
          )}
          {activeScreen === 'booking' && (
            <BookingSection setActiveAgentId={setActiveAgentId} />
          )}

          {/* SOS Button - visible on all screens except welcome */}
          {!isWelcome && <SOSButton />}

          {/* Agent Info Panel */}
          {!isWelcome && (
            <div className="fixed bottom-[4.5rem] left-1/2 -translate-x-1/2 max-w-md w-full px-4 z-30 pointer-events-none">
              <div className="pointer-events-auto">
                <button
                  onClick={() => setAgentInfoOpen(p => !p)}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-white/80 backdrop-blur-[16px] border border-white/[0.18] rounded-t-xl text-xs text-muted-foreground shadow-sm"
                >
                  <span className="font-medium">AI Agents</span>
                  <div className="flex items-center gap-2">
                    {activeAgentId && (
                      <Badge variant="default" className="text-[9px] rounded-full animate-pulse h-4">
                        Processing
                      </Badge>
                    )}
                    {agentInfoOpen ? <FiChevronDown size={12} /> : <FiChevronUp size={12} />}
                  </div>
                </button>
                {agentInfoOpen && (
                  <div className="bg-white/90 backdrop-blur-[16px] border border-t-0 border-white/[0.18] rounded-b-xl px-3 py-2 space-y-1.5 shadow-lg">
                    {AGENTS.map(a => (
                      <div key={a.id} className="flex items-center gap-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          activeAgentId === a.id ? 'bg-accent animate-pulse' : 'bg-muted-foreground/30'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{a.name}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{a.purpose}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          {!isWelcome && (
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-white/80 backdrop-blur-[16px] border-t border-white/[0.18] z-40">
              <div className="flex items-center justify-around py-2 px-2">
                {navItems.map(item => {
                  const IconComp = item.icon
                  const isActive = activeScreen === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200',
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <IconComp size={20} className={isActive ? 'text-primary' : ''} />
                      <span className={cn('text-[10px] font-medium', isActive && 'text-primary')}>{item.label}</span>
                      {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
                    </button>
                  )
                })}
              </div>
            </nav>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
