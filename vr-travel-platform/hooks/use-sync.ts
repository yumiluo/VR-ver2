"use client"

import { useEffect, useState, useCallback } from "react"
import { SyncManager, type SyncState, type RoomUser, type ChatMessage, type RoomState } from "@/lib/sync-manager"

export function useSync(roomId: string, userId: string, userName: string) {
  const [syncManager, setSyncManager] = useState<SyncManager | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [syncState, setSyncState] = useState<SyncState | null>(null)
  const [users, setUsers] = useState<RoomUser[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [roomState, setRoomState] = useState<RoomState | null>(null)

  // Initialize sync manager
  useEffect(() => {
    const manager = new SyncManager(roomId, userId, userName)
    setSyncManager(manager)

    // Set up event handlers
    manager.onConnectionChange(setIsConnected)
    manager.onSyncUpdate(setSyncState)
    manager.onUserUpdate(setUsers)
    manager.onChatMessage((message) => {
      setMessages((prev) => [...prev, message])
    })
    manager.onRoomUpdate(setRoomState)

    // Connect to sync server
    manager.connect().catch(console.error)

    return () => {
      manager.disconnect()
    }
  }, [roomId, userId, userName])

  // Sync methods
  const sendPlayState = useCallback(
    (isPlaying: boolean, currentTime: number) => {
      syncManager?.sendPlayState(isPlaying, currentTime)
    },
    [syncManager],
  )

  const sendSeekState = useCallback(
    (currentTime: number) => {
      syncManager?.sendSeekState(currentTime)
    },
    [syncManager],
  )

  const sendMessage = useCallback(
    (message: string) => {
      syncManager?.sendMessage(message)
    },
    [syncManager],
  )

  return {
    isConnected,
    syncState,
    users,
    messages,
    roomState,
    sendPlayState,
    sendSeekState,
    sendMessage,
    isHost: syncManager?.isHost() || false,
  }
}
