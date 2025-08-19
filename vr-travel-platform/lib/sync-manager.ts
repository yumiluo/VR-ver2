"use client"

export interface SyncState {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  lastUpdate: number
}

export interface RoomUser {
  id: string
  name: string
  avatar?: string
  isHost: boolean
  isConnected: boolean
  lastSeen: number
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: number
  type: "message" | "system"
}

export interface RoomState {
  id: string
  name: string
  videoId: string
  syncState: SyncState
  users: RoomUser[]
  messages: ChatMessage[]
  isLocked: boolean
}

export class SyncManager {
  private ws: WebSocket | null = null
  private roomId: string
  private userId: string
  private userName: string
  private callbacks: {
    onSyncUpdate?: (state: SyncState) => void
    onUserUpdate?: (users: RoomUser[]) => void
    onChatMessage?: (message: ChatMessage) => void
    onRoomUpdate?: (room: RoomState) => void
    onConnectionChange?: (connected: boolean) => void
  } = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private connectionTimeout = 10000 // Added connection timeout

  constructor(roomId: string, userId: string, userName: string) {
    this.roomId = roomId
    this.userId = userId
    this.userName = userName
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Connect to real WebSocket server
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"
        console.log("Attempting to connect to WebSocket:", wsUrl)

        this.ws = new WebSocket(wsUrl)

        const connectionTimer = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.log("WebSocket connection timeout")
            this.ws.close()
            this.simulateOfflineMode()
            reject(new Error(`WebSocket connection timeout to ${wsUrl}`))
          }
        }, this.connectionTimeout)

        this.ws.onopen = () => {
          console.log("WebSocket connected successfully")
          clearTimeout(connectionTimer)
          this.reconnectAttempts = 0
          this.callbacks.onConnectionChange?.(true)

          // Send join room message
          this.sendMessage({
            type: "join-room",
            roomId: this.roomId,
            user: {
              id: this.userId,
              name: this.userName,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.userId}`,
            },
          })

          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimer)
          console.log("WebSocket connection closed:", event.code, event.reason)
          this.callbacks.onConnectionChange?.(false)

          if (event.code !== 1000) {
            this.attemptReconnect()
          }
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimer)
          console.error("WebSocket connection failed:", error)
          console.log("Make sure WebSocket server is running on", wsUrl)

          this.callbacks.onConnectionChange?.(false)

          // Create a user-friendly error message
          const errorMessage = `WebSocket server not available at ${wsUrl}. Running in offline mode.`

          // Simulate offline room state
          this.simulateOfflineMode()

          reject(new Error(errorMessage))
        }
      } catch (error) {
        console.error("Failed to create WebSocket:", error)
        this.simulateOfflineMode()
        reject(error)
      }
    })
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case "room-joined":
        this.callbacks.onUserUpdate?.(data.participants)
        break
      case "user-joined":
        // Handle new user joining
        break
      case "user-left":
        // Handle user leaving
        break
      case "video-sync":
        this.callbacks.onSyncUpdate?.(data.syncState)
        break
      case "chat-message":
        this.callbacks.onChatMessage?.(data.message)
        break
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect().catch((error) => {
          console.log("Reconnection failed:", error.message)
        })
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.log("Max reconnection attempts reached, switching to offline mode")
      this.simulateOfflineMode()
    }
  }

  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.log("Cannot send message - WebSocket not connected:", message.type)
    }
  }

  private simulateOfflineMode() {
    console.log("Running in offline mode - WebSocket features disabled")

    // Simulate being the only user in the room
    const offlineUser: RoomUser = {
      id: this.userId,
      name: this.userName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.userId}`,
      isHost: true,
      isConnected: true,
      lastSeen: Date.now(),
    }

    this.callbacks.onUserUpdate?.([offlineUser])

    // Add system message about offline mode
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: "system",
      userName: "System",
      message:
        "WebSocket server unavailable. You are viewing in offline mode. Video controls are available but synchronization is disabled.",
      timestamp: Date.now(),
      type: "system",
    }

    this.callbacks.onChatMessage?.(systemMessage)
  }

  disconnect() {
    if (this.ws) {
      this.sendMessage({
        type: "leave-room",
        roomId: this.roomId,
        userId: this.userId,
      })
      this.ws.close()
      this.ws = null
    }
    this.callbacks.onConnectionChange?.(false)
  }

  // Video sync methods
  sendPlayState(isPlaying: boolean, currentTime: number) {
    this.sendMessage({
      type: "video-sync",
      action: "play-pause",
      isPlaying,
      currentTime,
      userId: this.userId,
      roomId: this.roomId,
    })
  }

  sendSeekState(currentTime: number) {
    this.sendMessage({
      type: "video-sync",
      action: "seek",
      currentTime,
      userId: this.userId,
      roomId: this.roomId,
    })
  }

  // Chat methods
  sendChatMessage(message: string) {
    this.sendMessage({
      type: "chat-message",
      message,
      userId: this.userId,
      userName: this.userName,
      roomId: this.roomId,
      timestamp: Date.now(),
    })
  }

  // Event handlers
  onSyncUpdate(callback: (state: SyncState) => void) {
    this.callbacks.onSyncUpdate = callback
  }

  onUserUpdate(callback: (users: RoomUser[]) => void) {
    this.callbacks.onUserUpdate = callback
  }

  onChatMessage(callback: (message: ChatMessage) => void) {
    this.callbacks.onChatMessage = callback
  }

  onRoomUpdate(callback: (room: RoomState) => void) {
    this.callbacks.onRoomUpdate = callback
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.callbacks.onConnectionChange = callback
  }

  // Utility methods
  isHost(): boolean {
    // In offline mode, user is always the host
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return true
    }
    // This would be determined by the server in online mode
    return false
  }

  getRoomId(): string {
    return this.roomId
  }

  getUserId(): string {
    return this.userId
  }
}
