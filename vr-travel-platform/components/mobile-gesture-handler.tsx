"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface MobileGestureHandlerProps {
  onPinch?: (scale: number) => void
  onRotate?: (angle: number) => void
  onSwipe?: (direction: "up" | "down" | "left" | "right", velocity: number) => void
  onDoubleTap?: () => void
  children: React.ReactNode
}

export function MobileGestureHandler({ onPinch, onRotate, onSwipe, onDoubleTap, children }: MobileGestureHandlerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gestureState = useRef({
    isGesturing: false,
    initialDistance: 0,
    initialAngle: 0,
    lastTap: 0,
    startTouch: { x: 0, y: 0 },
    startTime: 0,
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const getAngle = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return (Math.atan2(dy, dx) * 180) / Math.PI
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touches = e.touches
      const now = Date.now()

      if (touches.length === 1) {
        // Single touch - check for double tap
        const timeSinceLastTap = now - gestureState.current.lastTap
        if (timeSinceLastTap < 300) {
          onDoubleTap?.()
        }
        gestureState.current.lastTap = now

        // Store for swipe detection
        gestureState.current.startTouch = {
          x: touches[0].clientX,
          y: touches[0].clientY,
        }
        gestureState.current.startTime = now
      } else if (touches.length === 2) {
        // Multi-touch gesture
        gestureState.current.isGesturing = true
        gestureState.current.initialDistance = getDistance(touches[0], touches[1])
        gestureState.current.initialAngle = getAngle(touches[0], touches[1])
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touches = e.touches

      if (touches.length === 2 && gestureState.current.isGesturing) {
        const currentDistance = getDistance(touches[0], touches[1])
        const currentAngle = getAngle(touches[0], touches[1])

        // Pinch gesture
        if (onPinch) {
          const scale = currentDistance / gestureState.current.initialDistance
          onPinch(scale)
        }

        // Rotation gesture
        if (onRotate) {
          const angleDiff = currentAngle - gestureState.current.initialAngle
          onRotate(angleDiff)
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touches = e.touches

      if (touches.length === 0) {
        // Check for swipe
        if (onSwipe && gestureState.current.startTime) {
          const endTime = Date.now()
          const duration = endTime - gestureState.current.startTime

          if (duration < 500) {
            // Quick gesture
            const touch = e.changedTouches[0]
            const dx = touch.clientX - gestureState.current.startTouch.x
            const dy = touch.clientY - gestureState.current.startTouch.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance > 50) {
              // Minimum swipe distance
              const velocity = distance / duration

              if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                onSwipe(dx > 0 ? "right" : "left", velocity)
              } else {
                // Vertical swipe
                onSwipe(dy > 0 ? "down" : "up", velocity)
              }
            }
          }
        }

        gestureState.current.isGesturing = false
        gestureState.current.startTime = 0
      }
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [onPinch, onRotate, onSwipe, onDoubleTap])

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  )
}
