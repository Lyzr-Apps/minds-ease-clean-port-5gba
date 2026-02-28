'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { FiHeart, FiShield, FiStar } from 'react-icons/fi'

interface WelcomeSectionProps {
  onGetStarted: () => void
}

export default function WelcomeSection({ onGetStarted }: WelcomeSectionProps) {
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 text-primary/20 animate-pulse">
        <FiHeart size={32} />
      </div>
      <div className="absolute top-40 right-12 text-accent/20 animate-pulse" style={{ animationDelay: '1s' }}>
        <FiShield size={28} />
      </div>
      <div className="absolute bottom-32 left-16 text-primary/15 animate-pulse" style={{ animationDelay: '2s' }}>
        <FiStar size={24} />
      </div>
      <div className="absolute bottom-48 right-20 text-accent/15 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <FiHeart size={20} />
      </div>

      <div
        className={`max-w-md w-full text-center transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Logo / Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FiHeart className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">
          MindEase
        </h1>
        <p className="text-lg text-primary font-medium mb-4">
          Your AI-Powered Mental Wellness Companion
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 px-4">
          Take charge of your mental well-being with personalized mood analysis,
          empathetic AI support, guided relaxation exercises, and easy access to
          professional psychologists — all in one place.
        </p>

        {/* Feature highlights */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiHeart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Mood Check</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <FiShield className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground">Safe Space</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiStar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Expert Help</span>
          </div>
        </div>

        {/* Phone input */}
        <div className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-lg rounded-2xl p-6 mb-6 text-left">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Mobile Number
          </label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 bg-secondary rounded-xl text-sm text-muted-foreground font-medium min-w-[60px] justify-center">
              +91
            </div>
            <Input
              type="tel"
              placeholder="Enter your mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl bg-white/50 border-border"
            />
          </div>

          <div className="flex items-start gap-2 mt-4">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I agree to the Terms & Conditions and Privacy Policy. Your data is
              encrypted and never shared.
            </label>
          </div>
        </div>

        <Button
          onClick={onGetStarted}
          disabled={!agreed || phone.length < 10}
          className="w-full rounded-full py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
        >
          Get Started
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Your privacy is our priority. All conversations are confidential.
        </p>
      </div>
    </div>
  )
}
