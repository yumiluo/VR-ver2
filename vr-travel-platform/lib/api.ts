// Real API integration structure
export interface Room {
  id: string
  name: string
  description: string
  videoId: string
  videoTitle: string
  videoThumbnail: string
  videoDuration: string
  location: string
  hostId: string
  hostName: string
  hostAvatar?: string
  participants: number
  maxParticipants: number
  isPrivate: boolean
  status: "waiting" | "watching"
  currentTime: number
  createdAt: string
  updatedAt: string
}

export interface Video {
  id: string
  title: string
  description: string
  duration: string
  location: string
  thumbnail: string
  src: string
  views: number
  likes: number
  createdAt: string
}

export interface User {
  id: string
  name: string
  avatar?: string
  isHost: boolean
  isConnected: boolean
  lastSeen: string
}

export interface CreateRoomRequest {
  name: string
  description: string
  videoId: string
  maxParticipants: number
  isPrivate: boolean
  password?: string
}

// API functions
export async function fetchRooms(): Promise<Room[]> {
  try {
    const response = await fetch("/api/rooms")
    if (!response.ok) throw new Error("Failed to fetch rooms")
    return await response.json()
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return []
  }
}

export async function fetchVideos(): Promise<Video[]> {
  try {
    const response = await fetch("/api/videos")
    if (!response.ok) throw new Error("Failed to fetch videos")
    return await response.json()
  } catch (error) {
    console.error("Error fetching videos:", error)
    return []
  }
}

export async function createRoom(roomData: CreateRoomRequest): Promise<Room | null> {
  try {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    })
    if (!response.ok) throw new Error("Failed to create room")
    return await response.json()
  } catch (error) {
    console.error("Error creating room:", error)
    return null
  }
}

export async function joinRoom(roomId: string, password?: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/rooms/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    return response.ok
  } catch (error) {
    console.error("Error joining room:", error)
    return false
  }
}

export async function fetchRoomDetails(roomId: string): Promise<Room | null> {
  try {
    const response = await fetch(`/api/rooms/${roomId}`)
    if (!response.ok) throw new Error("Failed to fetch room details")
    return await response.json()
  } catch (error) {
    console.error("Error fetching room details:", error)
    return null
  }
}

export async function fetchVideoDetails(videoId: string): Promise<Video | null> {
  try {
    const response = await fetch(`/api/videos/${videoId}`)
    if (!response.ok) throw new Error("Failed to fetch video details")
    return await response.json()
  } catch (error) {
    console.error("Error fetching video details:", error)
    return null
  }
}
