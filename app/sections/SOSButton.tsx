'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FiPhone, FiAlertTriangle, FiMapPin } from 'react-icons/fi'

export default function SOSButton() {
  const [open, setOpen] = useState(false)
  const [shareLocation, setShareLocation] = useState(false)

  const handleCallNow = () => {
    setOpen(false)
  }

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg shadow-destructive/30 animate-pulse hover:animate-none transition-transform hover:scale-110 active:scale-95"
        aria-label="SOS Emergency"
      >
        <FiPhone size={22} />
      </button>

      {/* SOS Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl bg-white/90 backdrop-blur-[16px] border border-white/[0.18]">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <FiAlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Emergency Support</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to contact emergency mental health support? A trained
              professional will be connected to you immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Helpline info */}
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs font-medium text-foreground mb-1">National Helpline</p>
              <p className="text-lg font-bold text-primary">iCall: 9152987821</p>
              <p className="text-xs text-muted-foreground">Available 24/7, confidential</p>
            </div>

            {/* Location toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMapPin size={14} className="text-muted-foreground" />
                <Label htmlFor="location" className="text-sm text-foreground">Share my location</Label>
              </div>
              <Switch
                id="location"
                checked={shareLocation}
                onCheckedChange={setShareLocation}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleCallNow}
                className="flex-1 rounded-xl shadow-md shadow-destructive/20"
              >
                <FiPhone className="mr-2" size={16} />
                Call Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
