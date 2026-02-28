'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiWind, FiSquare, FiUser, FiActivity, FiNavigation, FiHeart, FiArrowLeft, FiPlay, FiPause, FiRotateCcw, FiCheck } from 'react-icons/fi'

interface Exercise {
  id: string
  title: string
  duration: number
  icon: React.ElementType
  color: string
  instructions: string[]
  breathPattern?: { inhale: number; hold: number; exhale: number; holdOut?: number }
}

const exercises: Exercise[] = [
  {
    id: 'deep-breathing',
    title: 'Deep Breathing',
    duration: 300,
    icon: FiWind,
    color: 'bg-primary/10 text-primary',
    instructions: [
      'Find a comfortable seated position.',
      'Breathe in slowly through your nose for 4 seconds.',
      'Hold your breath gently for 2 seconds.',
      'Exhale slowly through your mouth for 6 seconds.',
      'Repeat the cycle. Focus on the sensation of your breath.',
    ],
    breathPattern: { inhale: 4, hold: 2, exhale: 6 },
  },
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    duration: 240,
    icon: FiSquare,
    color: 'bg-accent/10 text-accent',
    instructions: [
      'Sit upright in a comfortable chair.',
      'Inhale through your nose for 4 seconds.',
      'Hold your breath for 4 seconds.',
      'Exhale through your mouth for 4 seconds.',
      'Hold again for 4 seconds, then repeat.',
    ],
    breathPattern: { inhale: 4, hold: 4, exhale: 4, holdOut: 4 },
  },
  {
    id: 'body-scan',
    title: 'Body Scan Meditation',
    duration: 600,
    icon: FiUser,
    color: 'bg-blue-500/10 text-blue-500',
    instructions: [
      'Lie down or sit comfortably. Close your eyes.',
      'Start at the top of your head, noticing sensations.',
      'Slowly move attention down: forehead, face, neck.',
      'Continue to shoulders, arms, chest, belly.',
      'Scan through hips, legs, feet. Release tension at each point.',
    ],
  },
  {
    id: 'pmr',
    title: 'Progressive Muscle Relaxation',
    duration: 480,
    icon: FiActivity,
    color: 'bg-purple-500/10 text-purple-500',
    instructions: [
      'Tense your feet muscles tightly for 5 seconds.',
      'Release and notice the difference for 10 seconds.',
      'Move up to calves, thighs, abdomen, chest.',
      'Tense each group, then release fully.',
      'Finish with hands, arms, shoulders, and face.',
    ],
  },
  {
    id: 'mindful-walking',
    title: 'Mindful Walking',
    duration: 600,
    icon: FiNavigation,
    color: 'bg-green-500/10 text-green-500',
    instructions: [
      'Walk slowly in a quiet, safe space.',
      'Notice each footstep: heel, ball, toes.',
      'Feel the ground beneath you with each step.',
      'Observe your surroundings without judgment.',
      'If your mind wanders, gently return focus to walking.',
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude Practice',
    duration: 300,
    icon: FiHeart,
    color: 'bg-rose-500/10 text-rose-500',
    instructions: [
      'Close your eyes and take three deep breaths.',
      'Think of one person you are grateful for.',
      'Think of one experience today you appreciated.',
      'Think of one quality about yourself you value.',
      'Sit with these feelings of gratitude for a moment.',
    ],
  },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ExercisesSection() {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdOut'>('inhale')
  const [phaseTime, setPhaseTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          setCompleted(true)
          return 0
        }
        return prev - 1
      })

      if (activeExercise?.breathPattern) {
        setPhaseTime(prev => {
          const pattern = activeExercise.breathPattern
          if (!pattern) return 0
          let limit = 4
          if (breathPhase === 'inhale') limit = pattern.inhale
          else if (breathPhase === 'hold') limit = pattern.hold
          else if (breathPhase === 'exhale') limit = pattern.exhale
          else if (breathPhase === 'holdOut') limit = pattern.holdOut ?? 0

          if (prev >= limit - 1) {
            setBreathPhase(p => {
              if (p === 'inhale') return 'hold'
              if (p === 'hold') return 'exhale'
              if (p === 'exhale') return pattern.holdOut ? 'holdOut' : 'inhale'
              return 'inhale'
            })
            return 0
          }
          return prev + 1
        })
      }
    }, 1000)

    return () => clearTimer()
  }, [isRunning, timeLeft, breathPhase, activeExercise, clearTimer])

  const startExercise = (ex: Exercise) => {
    setActiveExercise(ex)
    setTimeLeft(ex.duration)
    setIsRunning(false)
    setCompleted(false)
    setBreathPhase('inhale')
    setPhaseTime(0)
  }

  const toggleRunning = () => setIsRunning(prev => !prev)

  const resetExercise = () => {
    clearTimer()
    if (activeExercise) {
      setTimeLeft(activeExercise.duration)
      setIsRunning(false)
      setCompleted(false)
      setBreathPhase('inhale')
      setPhaseTime(0)
    }
  }

  const goBack = () => {
    clearTimer()
    setActiveExercise(null)
    setIsRunning(false)
    setCompleted(false)
  }

  const getCircleScale = () => {
    if (!activeExercise?.breathPattern || !isRunning) return 'scale-75'
    if (breathPhase === 'inhale') return 'scale-100'
    if (breathPhase === 'hold') return 'scale-100'
    if (breathPhase === 'exhale') return 'scale-75'
    return 'scale-75'
  }

  const getPhaseLabel = () => {
    if (breathPhase === 'inhale') return 'Breathe In'
    if (breathPhase === 'hold') return 'Hold'
    if (breathPhase === 'exhale') return 'Breathe Out'
    return 'Hold'
  }

  // Active Exercise View
  if (activeExercise) {
    const totalDur = activeExercise.duration
    const progressPct = totalDur > 0 ? ((totalDur - timeLeft) / totalDur) * 100 : 0

    return (
      <div className="px-4 py-6 pb-24 flex flex-col items-center min-h-[calc(100vh-8rem)]">
        <div className="w-full flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="rounded-full">
            <FiArrowLeft size={18} />
          </Button>
          <h3 className="flex-1 text-center text-lg font-semibold text-foreground pr-10">{activeExercise.title}</h3>
        </div>

        {completed ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-accent/10 flex items-center justify-center">
              <FiCheck className="w-16 h-16 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Great job!</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              You have completed the {activeExercise.title} exercise. Taking time for yourself is important.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetExercise} className="rounded-xl">
                <FiRotateCcw className="mr-2" size={14} /> Repeat
              </Button>
              <Button onClick={goBack} className="rounded-xl">
                All Exercises
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            {/* Breathing Circle */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-primary/5 transition-transform duration-[4000ms] ease-in-out ${getCircleScale()}`} />
              <div className={`absolute inset-4 rounded-full bg-primary/10 transition-transform duration-[4000ms] ease-in-out ${getCircleScale()}`} />
              <div className={`absolute inset-8 rounded-full bg-primary/15 transition-transform duration-[4000ms] ease-in-out ${getCircleScale()}`} />
              <div className="relative z-10 text-center">
                {activeExercise.breathPattern && isRunning ? (
                  <>
                    <p className="text-lg font-semibold text-primary">{getPhaseLabel()}</p>
                    <p className="text-3xl font-bold text-foreground">{formatTime(timeLeft)}</p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-foreground">{formatTime(timeLeft)}</p>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <Button variant="outline" size="icon" onClick={resetExercise} className="rounded-full w-12 h-12">
                <FiRotateCcw size={18} />
              </Button>
              <Button size="icon" onClick={toggleRunning} className="rounded-full w-16 h-16 shadow-lg shadow-primary/20">
                {isRunning ? <FiPause size={24} /> : <FiPlay size={24} />}
              </Button>
            </div>

            {/* Instructions */}
            <Card className="w-full bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-2xl">
              <CardContent className="py-4">
                <p className="text-xs font-semibold text-foreground mb-2">Instructions</p>
                <ol className="space-y-1.5">
                  {activeExercise.instructions.map((inst, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary font-semibold flex-shrink-0">{i + 1}.</span>
                      {inst}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Exercise List
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="px-4 py-6 pb-24 space-y-4">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-foreground">Relaxation Exercises</h2>
          <p className="text-sm text-muted-foreground">Choose an exercise to begin</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {exercises.map((ex) => {
            const IconComp = ex.icon
            return (
              <Card
                key={ex.id}
                className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.03] active:scale-95"
                onClick={() => startExercise(ex)}
              >
                <CardContent className="py-5 flex flex-col items-center text-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl ${ex.color} flex items-center justify-center`}>
                    <IconComp size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{ex.title}</p>
                    <Badge variant="secondary" className="text-[10px] rounded-full mt-1">
                      {Math.floor(ex.duration / 60)} min
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}
