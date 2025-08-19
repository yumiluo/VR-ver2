"use client"

import type React from "react"

import { VideoPlayer360 } from "@/components/video-player-360"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeviceOptimizedControls } from "@/components/device-optimized-controls"
import { MobileGestureHandler } from "@/components/mobile-gesture-handler"
import { ArrowLeft, Users, Share2, Heart, MessageCircle, Wifi, WifiOff, Maximize2, Minimize2 } from "lucide-react"
import Link from "next/link"
import { useSync } from "@/hooks/use-sync"
import { useDevice } from "@/hooks/use-device"
import { useState } from "react"

// Mock data - in real app this would come from API
const videoData = {
  id: "1",
  title: "Northern Lights, Iceland",
  description:
    "Experience the breathtaking Aurora Borealis dancing across the Icelandic sky in this immersive 360° journey.",
  duration: "15:32",
  viewers: 1247,
  likes: 892,
  src: "/placeholder.mp4", // This would be a real 360° video URL
  thumbnail: "/placeholder.svg?height=400&width=600",
  location: "Reykjavik, Iceland",
  guide: {
    name: "Erik Johansson",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Professional Arctic photographer and VR content creator",
  },
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const [chatInput, setChatInput] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMobileControls, setShowMobileControls] = useState(false)
  const device = useDevice()

  const { isConnected, syncState, users, messages, roomState, sendPlayState, sendSeekState, sendMessage, isHost } =
    useSync(params.id, "current-user-id", "You")

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    console.log("[v0] Video time update:", { currentTime, duration })
  }

  const handlePlay = () => {
    console.log("[v0] Video started playing")
  }

  const handlePause = () => {
    console.log("[v0] Video paused")
  }

  const handleSyncPlay = (isPlaying: boolean, currentTime: number) => {
    sendPlayState(isPlaying, currentTime)
  }

  const handleSyncSeek = (currentTime: number) => {
    sendSeekState(currentTime)
  }

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput.trim())
      setChatInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleResetView = () => {
    console.log("[v0] Resetting view")
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleVolumeToggle = () => {
    console.log("[v0] Toggling volume")
  }

  const handleShowSettings = () => {
    console.log("[v0] Showing settings")
  }

  const handleShowInfo = () => {
    setShowMobileControls(!showMobileControls)
  }

  // Mobile gesture handlers
  const handlePinch = (scale: number) => {
    console.log("[v0] Pinch gesture:", scale)
  }

  const handleRotate = (angle: number) => {
    console.log("[v0] Rotate gesture:", angle)
  }

  const handleSwipe = (direction: string, velocity: number) => {
    console.log("[v0] Swipe gesture:", direction, velocity)
    if (direction === "up" && device.type === "mobile") {
      setShowMobileControls(true)
    } else if (direction === "down" && device.type === "mobile") {
      setShowMobileControls(false)
    }
  }

  const handleDoubleTap = () => {
    console.log("[v0] Double tap - toggling fullscreen")
    handleToggleFullscreen()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Responsive */}
      <header
        className={`sticky top-0 z-50 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border ${
          device.type === "mobile" && isFullscreen ? "hidden" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:text-sidebar-primary">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-sidebar-border hidden sm:block" />
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="h-4 w-4 text-sidebar-primary" />
                <span className="font-serif text-xs sm:text-sm text-sidebar-foreground">
                  {users.length} <span className="hidden sm:inline">viewers connected</span>
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {isConnected ? (
                  <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                )}
                <span className="font-serif text-xs text-muted-foreground hidden sm:inline">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {device.type !== "mobile" && (
                <>
                  <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:text-sidebar-primary">
                    <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:text-sidebar-primary">
                    <Heart className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{videoData.likes}</span>
                  </Button>
                </>
              )}
              {device.type === "mobile" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-sidebar-foreground hover:text-sidebar-primary"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div
        className={`max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-6 ${
          device.type === "mobile" && isFullscreen ? "p-0" : ""
        }`}
      >
        <div
          className={`grid gap-4 sm:gap-6 ${
            device.type === "mobile" || isFullscreen ? "grid-cols-1" : "lg:grid-cols-4"
          }`}
        >
          {/* Main Video Player */}
          <div className={`${device.type === "mobile" || isFullscreen ? "col-span-1" : "lg:col-span-3"}`}>
            <div
              className={`bg-black rounded-lg overflow-hidden ${
                device.type === "mobile" && isFullscreen ? "fixed inset-0 z-40 rounded-none" : "aspect-video"
              }`}
            >
              <MobileGestureHandler
                onPinch={handlePinch}
                onRotate={handleRotate}
                onSwipe={handleSwipe}
                onDoubleTap={handleDoubleTap}
              >
                <VideoPlayer360
                  src={videoData.src}
                  title={videoData.title}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  syncState={syncState}
                  onSyncPlay={handleSyncPlay}
                  onSyncSeek={handleSyncSeek}
                  isHost={isHost}
                />
              </MobileGestureHandler>
            </div>

            {/* Mobile Controls Overlay */}
            {device.type === "mobile" && isFullscreen && showMobileControls && (
              <div className="fixed bottom-4 left-4 right-4 z-50">
                <Card className="border-border bg-background/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <DeviceOptimizedControls
                      onResetView={handleResetView}
                      onToggleFullscreen={handleToggleFullscreen}
                      onVolumeToggle={handleVolumeToggle}
                      onShowSettings={handleShowSettings}
                      onShowInfo={handleShowInfo}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Video Info - Hidden in mobile fullscreen */}
            {!(device.type === "mobile" && isFullscreen) && (
              <div className="mt-4 sm:mt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="font-sans text-xl sm:text-2xl font-bold text-foreground mb-2">{videoData.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-muted-foreground">
                      <Badge variant="secondary" className="font-serif text-xs sm:text-sm">
                        {videoData.location}
                      </Badge>
                      <span className="font-serif text-xs sm:text-sm">{videoData.duration}</span>
                      <span className="font-serif text-xs sm:text-sm">{users.length.toLocaleString()} total views</span>
                    </div>
                  </div>
                </div>

                <p className="font-serif text-sm sm:text-base text-foreground leading-relaxed mb-4 sm:mb-6">
                  {videoData.description}
                </p>

                {/* Guide Info */}
                <Card className="border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={videoData.guide.avatar || "/placeholder.svg"} alt={videoData.guide.name} />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {videoData.guide.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="font-sans text-base sm:text-lg">{videoData.guide.name}</CardTitle>
                        <p className="font-serif text-muted-foreground text-xs sm:text-sm">{videoData.guide.bio}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar - Hidden in mobile fullscreen */}
          {!(device.type === "mobile" && isFullscreen) && (
            <div className={`space-y-4 sm:space-y-6 ${device.type === "mobile" ? "col-span-1" : "lg:col-span-1"}`}>
              {/* Device Controls */}
              <DeviceOptimizedControls
                onResetView={handleResetView}
                onToggleFullscreen={handleToggleFullscreen}
                onVolumeToggle={handleVolumeToggle}
                onShowSettings={handleShowSettings}
                onShowInfo={handleShowInfo}
              />

              {/* Connected Users */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="font-sans text-base sm:text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="text-sm sm:text-base">Watching Together</span>
                    {isHost && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Host
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.slice(0, device.type === "mobile" ? 3 : 6).map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-serif text-xs sm:text-sm text-foreground">{user.name}</span>
                        {user.isHost && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Host
                          </Badge>
                        )}
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${user.isConnected ? "bg-green-500" : "bg-gray-400"}`}
                        title={user.isConnected ? "Online" : "Offline"}
                      />
                    </div>
                  ))}
                  {users.length > (device.type === "mobile" ? 3 : 6) && (
                    <p className="font-serif text-xs text-muted-foreground text-center">
                      +{users.length - (device.type === "mobile" ? 3 : 6)} more viewers
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Invite Friends
                  </Button>
                </CardContent>
              </Card>

              {/* Chat */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="font-sans text-base sm:text-lg flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="text-sm sm:text-base">Live Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`space-y-3 mb-4 overflow-y-auto ${device.type === "mobile" ? "max-h-32" : "max-h-64"}`}
                  >
                    {messages.slice(-10).map((message) => (
                      <div key={message.id} className="text-xs sm:text-sm">
                        {message.type === "system" ? (
                          <span className="font-serif text-muted-foreground italic">{message.message}</span>
                        ) : (
                          <>
                            <span className="font-semibold text-primary">{message.userName}</span>
                            <span className="font-serif text-muted-foreground ml-2">{message.message}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-2 text-xs sm:text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                    >
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
