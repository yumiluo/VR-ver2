import { NextResponse } from "next/server"
import type { Room } from "@/lib/api"

// This would typically fetch from a database
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const roomId = params.id

  // Mock room data - in production this would query the database
  const room: Room = {
    id: roomId,
    name: "Sample Room",
    description: "A sample room for testing",
    videoId: "tokyo-360",
    videoTitle: "Tokyo Street View 360°",
    videoThumbnail: "/placeholder.svg?height=200&width=300",
    videoDuration: "15:30",
    location: "Tokyo, Japan",
    hostId: "host1",
    hostName: "Sample Host",
    participants: 1,
    maxParticipants: 8,
    isPrivate: false,
    status: "waiting",
    currentTime: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(room)
}
