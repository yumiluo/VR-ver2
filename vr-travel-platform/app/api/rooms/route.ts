import { NextResponse } from "next/server"
import type { Room, CreateRoomRequest } from "@/lib/api"

// In-memory storage for demo purposes
// In production, this would connect to a real database
const rooms: Room[] = [
  {
    id: "1",
    name: "Tokyo Virtual Tour",
    description: "Experience the bustling streets of Tokyo in 360°",
    videoId: "tokyo-360",
    videoTitle: "Tokyo Street View 360°",
    videoThumbnail: "/placeholder.svg?height=200&width=300",
    videoDuration: "15:30",
    location: "Tokyo, Japan",
    hostId: "host1",
    hostName: "Yuki Tanaka",
    hostAvatar: "/placeholder.svg?height=40&width=40",
    participants: 3,
    maxParticipants: 8,
    isPrivate: false,
    status: "watching",
    currentTime: 450,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Paris Landmarks",
    description: "Tour the iconic landmarks of Paris",
    videoId: "paris-360",
    videoTitle: "Paris Landmarks 360°",
    videoThumbnail: "/placeholder.svg?height=200&width=300",
    videoDuration: "12:45",
    location: "Paris, France",
    hostId: "host2",
    hostName: "Marie Dubois",
    hostAvatar: "/placeholder.svg?height=40&width=40",
    participants: 5,
    maxParticipants: 10,
    isPrivate: false,
    status: "waiting",
    currentTime: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(rooms)
}

export async function POST(request: Request) {
  try {
    const roomData: CreateRoomRequest = await request.json()

    const newRoom: Room = {
      id: Date.now().toString(),
      name: roomData.name,
      description: roomData.description,
      videoId: roomData.videoId,
      videoTitle: "Sample Video Title", // Would be fetched from video data
      videoThumbnail: "/placeholder.svg?height=200&width=300",
      videoDuration: "10:00", // Would be fetched from video data
      location: "Sample Location",
      hostId: "current-user", // Would be from authenticated user
      hostName: "Current User",
      participants: 1,
      maxParticipants: roomData.maxParticipants,
      isPrivate: roomData.isPrivate,
      status: "waiting",
      currentTime: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    rooms.push(newRoom)
    return NextResponse.json(newRoom)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
