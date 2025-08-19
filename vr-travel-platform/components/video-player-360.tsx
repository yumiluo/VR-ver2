"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"
import type { SyncState } from "@/lib/sync-manager"

interface VideoPlayer360Props {
  src: string
  title?: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  syncState?: SyncState | null
  onSyncSeek?: (currentTime: number) => void
  isHost?: boolean
}

const getYouTubeEmbedUrl = (url: string) => {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`
  }
  return url
}

export function VideoPlayer360({
  src,
  title = "360° Video",
  onTimeUpdate,
  onPlay,
  onPause,
  syncState,
  onSyncSeek,
  isHost = false,
}: VideoPlayer360Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false)
  const [is360Image, setIs360Image] = useState(false)
  const [webglSupported, setWebglSupported] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

  // WebGL refs
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const shaderProgramRef = useRef<WebGLProgram | null>(null)
  const sphereBufferRef = useRef<WebGLBuffer | null>(null)
  const animationIdRef = useRef<number | null>(null)

  // 360° viewing state
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 })

  useEffect(() => {
    const isYT = src.includes("youtube.com") || src.includes("youtu.be")
    const isImage = src.match(/\.(jpg|jpeg|png|gif)$/i) || src.includes("360-image")
    setIsYouTubeVideo(isYT)
    setIs360Image(!!isImage)
    setVideoError(null)
  }, [src])

  // WebGL setup effect
  useEffect(() => {
    if (isYouTubeVideo) return

    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if (!gl) {
      console.error("WebGL not supported")
      setWebglSupported(false)
      return
    }

    glRef.current = gl

    // Vertex shader for 360° sphere
    const vertexShaderSource = `
      attribute vec3 position;
      attribute vec2 texCoord;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      varying vec2 vTexCoord;
      
      void main() {
        vTexCoord = texCoord;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    // Fragment shader for equirectangular mapping
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D texture;
      varying vec2 vTexCoord;
      
      void main() {
        gl_FragColor = texture2D(texture, vTexCoord);
      }
    `

    // Create and compile shaders
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (!vertexShader || !fragmentShader) {
      setWebglSupported(false)
      return
    }

    // Create program
    const shaderProgram = gl.createProgram()
    if (!shaderProgram) return

    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(shaderProgram))
      setWebglSupported(false)
      return
    }

    shaderProgramRef.current = shaderProgram

    // Create sphere geometry for 360° video
    const createSphere = (radius: number, segments: number) => {
      const vertices = []
      const texCoords = []
      const indices = []

      for (let lat = 0; lat <= segments; lat++) {
        const theta = (lat * Math.PI) / segments
        const sinTheta = Math.sin(theta)
        const cosTheta = Math.cos(theta)

        for (let lon = 0; lon <= segments; lon++) {
          const phi = (lon * 2 * Math.PI) / segments
          const sinPhi = Math.sin(phi)
          const cosPhi = Math.cos(phi)

          const x = cosPhi * sinTheta
          const y = cosTheta
          const z = sinPhi * sinTheta

          vertices.push(radius * x, radius * y, radius * z)
          texCoords.push(lon / segments, lat / segments)
        }
      }

      for (let lat = 0; lat < segments; lat++) {
        for (let lon = 0; lon < segments; lon++) {
          const first = lat * (segments + 1) + lon
          const second = first + segments + 1

          indices.push(first, second, first + 1)
          indices.push(second, second + 1, first + 1)
        }
      }

      return { vertices, texCoords, indices }
    }

    const sphere = createSphere(1, 32)

    // Create buffers
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.vertices), gl.STATIC_DRAW)

    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.texCoords), gl.STATIC_DRAW)

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphere.indices), gl.STATIC_DRAW)

    sphereBufferRef.current = indexBuffer

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (shaderProgram) gl.deleteProgram(shaderProgram)
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
    }
  }, [isYouTubeVideo])

  // WebGL rendering functions
  const createPerspectiveMatrix = useCallback((fov: number, aspect: number, near: number, far: number) => {
    const f = Math.tan(Math.PI * 0.5 - (0.5 * fov * Math.PI) / 180)
    const rangeInv = 1.0 / (near - far)

    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0,
    ])
  }, [])

  const createModelViewMatrix = useCallback((rotX: number, rotY: number) => {
    const cosX = Math.cos((rotX * Math.PI) / 180)
    const sinX = Math.sin((rotX * Math.PI) / 180)
    const cosY = Math.cos((rotY * Math.PI) / 180)
    const sinY = Math.sin((rotY * Math.PI) / 180)

    return new Float32Array([
      cosY,
      0,
      sinY,
      0,
      sinX * sinY,
      cosX,
      -sinX * cosY,
      0,
      -cosX * sinY,
      sinX,
      cosX * cosY,
      0,
      0,
      0,
      0,
      1,
    ])
  }, [])

  const renderWebGLFrame = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const gl = glRef.current
    const shaderProgram = shaderProgramRef.current

    if (!canvas || !gl || !shaderProgram || !webglSupported) return

    // Clear and setup WebGL state
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)

    gl["useProgram"](shaderProgram)

    // Create texture from video or image
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    if (is360Image) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      }
      img.onerror = () => setVideoError("Failed to load 360° image")
      img.src = src
    } else if (video && video.readyState >= 2) {
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      } catch (error) {
        console.error("Error creating video texture:", error)
        setVideoError("Failed to render video texture")
      }
    }

    // Set up matrices for 360° viewing
    const projectionMatrix = createPerspectiveMatrix(75, canvas.width / canvas.height, 0.1, 100)
    const modelViewMatrix = createModelViewMatrix(rotation.x, rotation.y)

    const projectionLocation = gl.getUniformLocation(shaderProgram, "projectionMatrix")
    const modelViewLocation = gl.getUniformLocation(shaderProgram, "modelViewMatrix")

    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix)
    gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix)

    if (isPlaying || is360Image) {
      animationIdRef.current = requestAnimationFrame(renderWebGLFrame)
    }
  }, [src, is360Image, rotation, isPlaying, webglSupported, createPerspectiveMatrix, createModelViewMatrix])

  useEffect(() => {
    if (isYouTubeVideo || !webglSupported) return

    const video = videoRef.current
    const handleLoadedData = () => renderWebGLFrame()
    const handleError = () => setVideoError("Failed to load video")

    if (is360Image) {
      renderWebGLFrame()
    } else if (video) {
      video.addEventListener("loadeddata", handleLoadedData)
      video.addEventListener("error", handleError)
    }

    return () => {
      if (video) {
        video.removeEventListener("loadeddata", handleLoadedData)
        video.removeEventListener("error", handleError)
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [renderWebGLFrame, is360Image, isYouTubeVideo, webglSupported])

  useEffect(() => {
    if (!syncState || !videoRef.current || isSyncing || isYouTubeVideo) return

    const video = videoRef.current
    const timeDiff = Math.abs(video.currentTime - syncState.currentTime)

    // Only sync if there's a significant time difference (>1 second)
    if (timeDiff > 1) {
      setIsSyncing(true)
      video.currentTime = syncState.currentTime
      setCurrentTime(syncState.currentTime)

      setTimeout(() => setIsSyncing(false), 500)
    }

    // Sync play/pause state
    if (syncState.isPlaying !== isPlaying) {
      if (syncState.isPlaying) {
        video.play()
        setIsPlaying(true)
      } else {
        video.pause()
        setIsPlaying(false)
      }
    }
  }, [syncState, isPlaying, isSyncing, isYouTubeVideo])

  // Handle device orientation for mobile VR
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        setDeviceOrientation({
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma,
        })

        // Apply device orientation to rotation
        setRotation((prev) => ({
          x: prev.x + (event.beta - deviceOrientation.beta) * 0.1,
          y: prev.y + (event.alpha - deviceOrientation.alpha) * 0.1,
        }))
      }
    }

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation)
      return () => window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [deviceOrientation])

  // Mouse/touch controls for 360° navigation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y

    setRotation((prev) => ({
      x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
    }))

    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return

    const deltaX = e.touches[0].clientX - lastMousePos.x
    const deltaY = e.touches[0].clientY - lastMousePos.y

    setRotation((prev) => ({
      x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
    }))

    setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Video controls
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!isPlaying) {
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              onPlay?.()
            })
            .catch((error) => {
              console.error("Video play failed:", error)
              setVideoError("Failed to play video. Please check the video format.")
            })
        }
      } else {
        video.pause()
        setIsPlaying(false)
        onPause?.()
      }
    } catch (error) {
      console.error("Video control error:", error)
      setVideoError("Video control failed")
    }
  }

  const toggleMute = () => {
    if (isYouTubeVideo) return

    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    if (isYouTubeVideo) return

    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleSeek = (value: number[]) => {
    if (isYouTubeVideo) return

    const video = videoRef.current
    if (!video) return

    const newTime = value[0]
    video.currentTime = newTime
    setCurrentTime(newTime)

    if (isHost) {
      onSyncSeek?.(newTime)
    }
  }

  const resetView = () => {
    setRotation({ x: 0, y: 0 })
  }

  const toggleFullscreen = () => {
    const element = isYouTubeVideo ? iframeRef.current : canvasRef.current
    if (!element) return

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  // Video event handlers
  const handleTimeUpdate = () => {
    if (isYouTubeVideo) return

    const video = videoRef.current
    if (!video || isSyncing) return

    setCurrentTime(video.currentTime)
    onTimeUpdate?.(video.currentTime, video.duration)
  }

  const handleLoadedMetadata = () => {
    if (isYouTubeVideo) return

    const video = videoRef.current
    if (!video) return

    setDuration(video.duration)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center p-6">
            <div className="text-red-400 text-lg font-semibold mb-2">Video Error</div>
            <div className="text-white/80 text-sm mb-4">{videoError}</div>
            <Button
              onClick={() => setVideoError(null)}
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {!webglSupported && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center p-6">
            <div className="text-yellow-400 text-lg font-semibold mb-2">WebGL Not Supported</div>
            <div className="text-white/80 text-sm">
              Your browser doesn't support WebGL. Falling back to standard video player.
            </div>
          </div>
        </div>
      )}

      {isYouTubeVideo ? (
        // YouTube iframe embed
        <iframe
          ref={iframeRef}
          src={getYouTubeEmbedUrl(src)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      ) : (
        <>
          {!is360Image && (
            <video
              ref={videoRef}
              src={src}
              className={webglSupported ? "hidden" : "w-full h-full object-cover"}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onError={() => setVideoError("Failed to load video file")}
              crossOrigin="anonymous"
              controls={!webglSupported}
            />
          )}

          {/* 360° Canvas - only show if WebGL is supported */}
          {webglSupported && (
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          )}

          {/* Fallback for 360° images when WebGL fails */}
          {is360Image && !webglSupported && (
            <img
              className="w-full h-full object-cover"
              src={src || "/placeholder.svg"}
              alt={title}
              crossOrigin="anonymous"
              onError={() => setVideoError("Failed to load 360° image")}
            />
          )}

          {isSyncing && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="font-serif text-sm">Syncing...</span>
              </div>
            </div>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Title */}
            <div className="absolute top-4 left-4 right-4">
              <h3 className="font-sans text-white text-lg font-semibold">{title}</h3>
              <div className="flex items-center gap-2">
                <p className="font-serif text-white/80 text-sm">
                  {is360Image ? "360° Image • Drag to look around" : "360° Video • Drag to look around"}
                </p>
                {isHost && (
                  <span className="bg-primary/80 text-primary-foreground px-2 py-1 rounded text-xs font-serif">
                    Host
                  </span>
                )}
              </div>
            </div>

            {!isPlaying && !is360Image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground"
                  disabled={!isHost && syncState?.isPlaying}
                >
                  <Play className="h-8 w-8 ml-1" />
                </Button>
              </div>
            )}

            {!is360Image && (
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                {/* Progress Bar */}
                <div className="flex items-center gap-3 text-white text-sm">
                  <span className="font-mono">{formatTime(currentTime)}</span>
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="flex-1"
                    disabled={!isHost}
                  />
                  <span className="font-mono">{formatTime(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                      disabled={!isHost}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    <Button size="sm" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>

                    <div className="flex items-center gap-2 w-24">
                      <Slider
                        value={[volume]}
                        max={1}
                        step={0.1}
                        onValueChange={handleVolumeChange}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetView}
                      className="text-white hover:bg-white/20"
                      title="Reset View"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {is360Image && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetView}
                  className="text-white hover:bg-white/20"
                  title="Reset View"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {isYouTubeVideo && (
            <div className="absolute top-4 left-4 right-4 pointer-events-none">
              <h3 className="font-sans text-white text-lg font-semibold drop-shadow-lg">{title}</h3>
              <div className="flex items-center gap-2">
                <p className="font-serif text-white/90 text-sm drop-shadow-lg">360° YouTube Video</p>
                {isHost && (
                  <span className="bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-serif drop-shadow-lg">
                    Host
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
