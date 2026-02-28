'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { callAIAgent } from '@/lib/aiAgent'
import { FiArrowLeft, FiArrowRight, FiLoader, FiWind, FiCalendar, FiStar } from 'react-icons/fi'

interface MoodTrackerSectionProps {
  onNavigate: (screen: string) => void
  setActiveAgentId: (id: string | null) => void
}

const MOOD_AGENT_ID = '69a28026ad98307a3fb27939'

interface MoodQuestion {
  id: number
  question: string
  options: string[]
}

const questions: MoodQuestion[] = [
  { id: 1, question: 'How are you feeling right now?', options: ['Great', 'Good', 'Okay', 'Not so good', 'Terrible'] },
  { id: 2, question: 'How well did you sleep last night?', options: ['Very well', 'Well', 'Average', 'Poorly', 'Very poorly'] },
  { id: 3, question: 'How would you rate your energy level?', options: ['Very high', 'High', 'Moderate', 'Low', 'Very low'] },
  { id: 4, question: 'How stressed are you feeling?', options: ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'] },
  { id: 5, question: 'How connected do you feel to others today?', options: ['Very connected', 'Connected', 'Somewhat', 'Disconnected', 'Very isolated'] },
  { id: 6, question: 'How is your appetite today?', options: ['Great', 'Good', 'Normal', 'Poor', 'No appetite'] },
  { id: 7, question: 'Have you been able to focus on tasks?', options: ['Very well', 'Well', 'Average', 'Poorly', 'Not at all'] },
]

interface MoodResult {
  mood?: string
  emoji?: string
  score?: number
  summary?: string
  suggestions?: Array<{ title?: string; description?: string; type?: string }>
}

export default function MoodTrackerSection({ onNavigate, setActiveAgentId }: MoodTrackerSectionProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MoodResult | null>(null)
  const [error, setError] = useState('')

  const progress = result ? 100 : ((currentQ + 1) / questions.length) * 100

  const handleSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentQ].id]: option }))
  }

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(prev => prev + 1)
  }
  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setActiveAgentId(MOOD_AGENT_ID)

    const answerStr = questions.map(q => `Q${q.id}: ${q.question} - Answer: ${answers[q.id] ?? 'Not answered'}`).join('; ')
    const message = `Here are my mood assessment answers: ${answerStr}`

    try {
      const res = await callAIAgent(message, MOOD_AGENT_ID)
      if (res.success && res.response?.result) {
        let parsed = res.response.result
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed) } catch { /* keep as-is */ }
        }
        setResult(parsed as MoodResult)
      } else {
        setError(res.error ?? 'Failed to analyze mood. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    }

    setLoading(false)
    setActiveAgentId(null)
  }

  const handleReset = () => {
    setCurrentQ(0)
    setAnswers({})
    setResult(null)
    setError('')
  }

  const getTypeIcon = (type?: string) => {
    if (type === 'exercise') return <FiWind size={16} />
    if (type === 'consultation') return <FiCalendar size={16} />
    return <FiStar size={16} />
  }

  const getTypeAction = (type?: string) => {
    if (type === 'exercise') return () => onNavigate('exercises')
    if (type === 'consultation') return () => onNavigate('booking')
    return undefined
  }

  if (result) {
    const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : []
    return (
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="px-4 py-6 pb-24 space-y-4">
          <Progress value={100} className="h-2 rounded-full" />

          {/* Result Card */}
          <Card className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-lg rounded-2xl text-center overflow-hidden">
            <CardContent className="py-8 space-y-4">
              <p className="text-5xl">{result?.emoji ?? '--'}</p>
              <div>
                <h3 className="text-xl font-bold text-foreground">{result?.mood ?? 'Unknown'}</h3>
                <Badge variant="secondary" className="mt-1 rounded-full">
                  Score: {result?.score ?? 0}/10
                </Badge>
              </div>
              {/* Score bar */}
              <div className="w-full max-w-xs mx-auto">
                <Progress value={(result?.score ?? 0) * 10} className="h-3 rounded-full" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed px-4">
                {result?.summary ?? ''}
              </p>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Personalized Suggestions</h3>
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <Card
                    key={i}
                    className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                    onClick={getTypeAction(s?.type)}
                  >
                    <CardContent className="py-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getTypeIcon(s?.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{s?.title ?? 'Suggestion'}</p>
                          <Badge variant="outline" className="text-[10px] rounded-full capitalize">{s?.type ?? 'tip'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s?.description ?? ''}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleReset} variant="outline" className="w-full rounded-xl">
            Take Assessment Again
          </Button>
        </div>
      </ScrollArea>
    )
  }

  const q = questions[currentQ]
  const isLast = currentQ === questions.length - 1
  const hasAnswer = !!answers[q.id]

  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      <Progress value={progress} className="h-2 rounded-full" />
      <p className="text-xs text-muted-foreground text-center">
        Question {currentQ + 1} of {questions.length}
      </p>

      <div className="min-h-[300px] flex flex-col">
        <h3 className="text-lg font-semibold text-foreground text-center mb-6 px-2">
          {q.question}
        </h3>

        <div className="space-y-3 flex-1">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 text-sm font-medium ${answers[q.id] === opt ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' : 'bg-white/75 backdrop-blur-[16px] border-white/[0.18] text-foreground hover:border-primary/40 hover:shadow-md'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQ === 0}
          className="flex-1 rounded-xl"
        >
          <FiArrowLeft className="mr-2" size={16} /> Back
        </Button>
        {isLast ? (
          <Button
            onClick={handleAnalyze}
            disabled={!hasAnswer || loading || Object.keys(answers).length < questions.length}
            className="flex-1 rounded-xl shadow-md shadow-primary/20"
          >
            {loading ? (
              <><FiLoader className="mr-2 animate-spin" size={16} /> Analyzing...</>
            ) : (
              'Analyze Mood'
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="flex-1 rounded-xl"
          >
            Next <FiArrowRight className="ml-2" size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
