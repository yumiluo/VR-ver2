"use client"

import { useEffect, useState } from "react"

export type DeviceType = "mobile" | "tablet" | "desktop" | "vr"
export type Platform = "ios" | "android" | "windows" | "macos" | "linux" | "unknown"

export interface DeviceInfo {
  type: DeviceType
  platform: Platform
  isTouch: boolean
  hasGyroscope: boolean
  hasVRSupport: boolean
  isStandalone: boolean
  screenSize: { width: number; height: number }
  orientation: "portrait" | "landscape"
}

export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: "desktop",
    platform: "unknown",
    isTouch: false,
    hasGyroscope: false,
    hasVRSupport: false,
    isStandalone: false,
    screenSize: { width: 0, height: 0 },
    orientation: "landscape",
  })

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const width = window.innerWidth
      const height = window.innerHeight

      // Detect device type
      let type: DeviceType = "desktop"
      if (width <= 768) {
        type = "mobile"
      } else if (width <= 1024) {
        type = "tablet"
      }

      // Check for VR
      if ("xr" in navigator || userAgent.includes("oculus") || userAgent.includes("vr")) {
        type = "vr"
      }

      // Detect platform
      let platform: Platform = "unknown"
      if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
        platform = "ios"
      } else if (userAgent.includes("android")) {
        platform = "android"
      } else if (userAgent.includes("windows")) {
        platform = "windows"
      } else if (userAgent.includes("mac")) {
        platform = "macos"
      } else if (userAgent.includes("linux")) {
        platform = "linux"
      }

      // Check for gyroscope
      const hasGyroscope = "DeviceOrientationEvent" in window

      // Check for VR support
      const hasVRSupport = "xr" in navigator || "getVRDisplays" in navigator

      // Check if running as standalone PWA
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

      // Determine orientation
      const orientation = width > height ? "landscape" : "portrait"

      setDeviceInfo({
        type,
        platform,
        isTouch,
        hasGyroscope,
        hasVRSupport,
        isStandalone,
        screenSize: { width, height },
        orientation,
      })
    }

    detectDevice()
    window.addEventListener("resize", detectDevice)
    window.addEventListener("orientationchange", detectDevice)

    return () => {
      window.removeEventListener("resize", detectDevice)
      window.removeEventListener("orientationchange", detectDevice)
    }
  }, [])

  return deviceInfo
}
