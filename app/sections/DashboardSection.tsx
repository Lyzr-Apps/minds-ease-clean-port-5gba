'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FiActivity, FiMessageCircle, FiWind, FiCalendar, FiSun, FiClock } from 'react-icons/fi'

interface DashboardSectionProps {
  onNavigate: (screen: string) => void
}

const WELLNESS_TIPS = [
  'Take a few deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. This activates your body\'s relaxation response.',
  'Try the 5-4-3-2-1 grounding technique: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
  'Practice gratitude by writing down three things you are thankful for today. It shifts your focus toward the positive.',
  'Set a small, achievable goal for today. Completing it will boost your confidence and sense of purpose.',
  'Stay hydrated and take short breaks every 90 minutes. Your brain needs rest to perform at its best.',
  'Reach out to someone you care about today. Connection is one of the strongest boosters of mental well-being.',
]

const quickActions = [
  { id: 'mood', label: 'Mood Check', icon: FiActivity, color: 'bg-primary/10 text-primary', screen: 'mood' },
  { id: 'chat', label: 'Chat', icon: FiMessageCircle, color: 'bg-accent/10 text-accent', screen: 'chat' },
  { id: 'exercises', label: 'Exercises', icon: FiWind, color: 'bg-blue-500/10 text-blue-500', screen: 'exercises' },
  { id: 'booking', label: 'Book Session', icon: FiCalendar, color: 'bg-purple-500/10 text-purple-500', screen: 'booking' },
]

export default function DashboardSection({ onNavigate }: DashboardSectionProps) {
  const [tipIndex, setTipIndex] = useState(0)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
    setTipIndex(now.getDate() % WELLNESS_TIPS.length)
  }, [])

  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      {/* Greeting */}
      <div className="pt-2">
        <p className="text-sm text-muted-foreground">{currentDate}</p>
        <h2 className="text-2xl font-bold text-foreground">Hello, User</h2>
        <p className="text-sm text-muted-foreground mt-1">How are you feeling today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const IconComp = action.icon
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.screen)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                <IconComp size={22} />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          )
        })}
      </div>

      {/* Wellness Tip */}
      <Card className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <FiSun className="w-4 h-4 text-accent" />
            </div>
            <CardTitle className="text-sm font-semibold">Wellness Tip of the Day</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {WELLNESS_TIPS[tipIndex] ?? WELLNESS_TIPS[0]}
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FiClock size={14} />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <Card className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-2xl">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FiActivity className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Start your first mood check</p>
                <p className="text-xs text-muted-foreground">Track your emotional well-being</p>
              </div>
              <Badge variant="secondary" className="text-xs rounded-full">New</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-2xl">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <FiMessageCircle className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Chat with your wellness companion</p>
                <p className="text-xs text-muted-foreground">24/7 empathetic support available</p>
              </div>
              <Badge variant="secondary" className="text-xs rounded-full">Try</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-2xl">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <FiWind className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Try a breathing exercise</p>
                <p className="text-xs text-muted-foreground">Guided relaxation in minutes</p>
              </div>
              <Badge variant="secondary" className="text-xs rounded-full">5 min</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
