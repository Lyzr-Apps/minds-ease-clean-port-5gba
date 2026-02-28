'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  FiHeart,
  FiShield,
  FiStar,
  FiSmartphone,
  FiLock,
  FiArrowLeft,
  FiCheck,
  FiLoader,
} from 'react-icons/fi'

interface WelcomeSectionProps {
  onGetStarted: () => void
}

type Step = 'phone' | 'otp' | 'verified'

export default function WelcomeSection({ onGetStarted }: WelcomeSectionProps) {
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState<Step>('phone')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [phoneError, setPhoneError] = useState('')

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const validatePhone = (num: string) => {
    const digits = num.replace(/\D/g, '')
    return digits.length === 10
  }

  const generateOtp = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)
    return code
  }, [])

  // Send OTP
  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '')
    if (!validatePhone(digits)) {
      setPhoneError('Please enter a valid 10-digit mobile number')
      return
    }
    setPhoneError('')
    setSending(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    const code = generateOtp()
    setSending(false)
    setStep('otp')
    setResendTimer(30)
    setOtp(['', '', '', '', '', ''])
    setOtpError('')

    // Show the OTP in an alert for demo purposes (no toast/sonner)
    // In production this would be sent via SMS
    setTimeout(() => {
      window.alert(`Your OTP is: ${code}\n\n(This is a demo. In production, this would be sent via SMS to +91 ${digits})`)
    }, 300)
  }

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setOtpError('')

    // Auto-focus next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all 6 digits entered
    const fullCode = newOtp.join('')
    if (fullCode.length === 6) {
      verifyOtp(fullCode)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
      const newOtp = [...otp]
      newOtp[index - 1] = ''
      setOtp(newOtp)
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || ''
      }
      setOtp(newOtp)
      const focusIdx = Math.min(pasted.length, 5)
      otpRefs.current[focusIdx]?.focus()

      if (pasted.length === 6) {
        verifyOtp(pasted)
      }
    }
  }

  // Verify OTP
  const verifyOtp = async (code: string) => {
    setVerifying(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    if (code === generatedOtp) {
      setStep('verified')
      setOtpError('')
      // Auto-proceed after a brief success animation
      setTimeout(() => {
        onGetStarted()
      }, 1500)
    } else {
      setOtpError('Invalid OTP. Please check and try again.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    }
    setVerifying(false)
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setSending(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    const code = generateOtp()
    setSending(false)
    setResendTimer(30)
    setOtp(['', '', '', '', '', ''])
    setOtpError('')

    setTimeout(() => {
      window.alert(`Your new OTP is: ${code}`)
    }, 300)
  }

  const maskedPhone = phone.replace(/\D/g, '').replace(/(\d{2})\d{4}(\d{4})/, '$1****$2')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 text-primary/20 animate-pulse">
        <FiHeart size={32} />
      </div>
      <div
        className="absolute top-40 right-12 text-accent/20 animate-pulse"
        style={{ animationDelay: '1s' }}
      >
        <FiShield size={28} />
      </div>
      <div
        className="absolute bottom-32 left-16 text-primary/15 animate-pulse"
        style={{ animationDelay: '2s' }}
      >
        <FiStar size={24} />
      </div>
      <div
        className="absolute bottom-48 right-20 text-accent/15 animate-pulse"
        style={{ animationDelay: '0.5s' }}
      >
        <FiHeart size={20} />
      </div>

      <div
        className={cn(
          'max-w-md w-full text-center transition-all duration-700 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Logo / Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FiHeart className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">MindEase</h1>
        <p className="text-lg text-primary font-medium mb-4">
          Your AI-Powered Mental Wellness Companion
        </p>

        {step === 'phone' && (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 px-4">
              Take charge of your mental well-being with personalized mood analysis, empathetic AI
              support, guided relaxation exercises, and easy access to professional psychologists —
              all in one place.
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

            {/* Phone input card */}
            <div className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-lg rounded-2xl p-6 mb-6 text-left">
              <label className="text-sm font-medium text-foreground mb-2 block">
                <FiSmartphone className="inline mr-1.5 mb-0.5" size={14} />
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
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPhone(val)
                    setPhoneError('')
                  }}
                  maxLength={10}
                  className={cn(
                    'rounded-xl bg-white/50 border-border',
                    phoneError && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
              </div>
              {phoneError && (
                <p className="text-xs text-destructive mt-2">{phoneError}</p>
              )}

              <div className="flex items-start gap-2 mt-4">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={v => setAgreed(v === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I agree to the Terms & Conditions and Privacy Policy. Your data is encrypted and
                  never shared.
                </label>
              </div>
            </div>

            <Button
              onClick={handleSendOtp}
              disabled={!agreed || phone.replace(/\D/g, '').length < 10 || sending}
              className="w-full rounded-full py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
            >
              {sending ? (
                <>
                  <FiLoader className="animate-spin mr-2" size={18} />
                  Sending OTP...
                </>
              ) : (
                'Get OTP'
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Your privacy is our priority. All conversations are confidential.
            </p>
          </>
        )}

        {step === 'otp' && (
          <div className="mt-4">
            {/* Back button */}
            <button
              onClick={() => {
                setStep('phone')
                setOtp(['', '', '', '', '', ''])
                setOtpError('')
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 mx-auto"
            >
              <FiArrowLeft size={14} />
              Change number
            </button>

            <div className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-lg rounded-2xl p-6 mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FiLock className="w-7 h-7 text-primary" />
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-1">Verify your number</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a 6-digit OTP to{' '}
                <span className="font-medium text-foreground">+91 {maskedPhone}</span>
              </p>

              {/* OTP Input boxes */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    disabled={verifying}
                    className={cn(
                      'w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all duration-200',
                      'bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/30',
                      digit
                        ? 'border-primary/50 text-foreground'
                        : 'border-border text-muted-foreground',
                      otpError && 'border-destructive/50',
                      verifying && 'opacity-50 cursor-not-allowed'
                    )}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Error message */}
              {otpError && (
                <div className="flex items-center justify-center gap-1.5 text-destructive mb-4">
                  <FiShield size={13} />
                  <p className="text-xs font-medium">{otpError}</p>
                </div>
              )}

              {/* Verifying state */}
              {verifying && (
                <div className="flex items-center justify-center gap-2 text-primary mb-4">
                  <FiLoader className="animate-spin" size={14} />
                  <p className="text-sm font-medium">Verifying...</p>
                </div>
              )}

              {/* Resend */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Resend OTP in{' '}
                    <span className="font-semibold text-foreground">
                      {resendTimer}s
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={sending}
                    className="text-sm text-primary font-medium hover:underline disabled:opacity-50 transition-colors"
                  >
                    {sending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                const code = otp.join('')
                if (code.length === 6) verifyOtp(code)
              }}
              disabled={otp.join('').length < 6 || verifying}
              className="w-full rounded-full py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
            >
              {verifying ? (
                <>
                  <FiLoader className="animate-spin mr-2" size={18} />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </div>
        )}

        {step === 'verified' && (
          <div className="mt-8">
            <div className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] shadow-lg rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
                <FiCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Verified</h2>
              <p className="text-sm text-muted-foreground">
                Your number has been verified successfully. Redirecting to your dashboard...
              </p>
              <div className="mt-4 flex justify-center">
                <FiLoader className="animate-spin text-primary" size={20} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
