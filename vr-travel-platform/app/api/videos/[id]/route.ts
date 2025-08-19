import { NextResponse } from "next/server"
import type { Video } from "@/lib/api"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const videoId = params.id

  // Mock video data - in production this would query the database
  const video: Video = {
    id: videoId,
    title: "Sample 360° Video",
    description: "A sample 360° video for testing",
    duration: "15:30",
    location: "Sample Location",
    thumbnail: "/placeholder.svg?height=200&width=300",
    src: "/placeholder.svg?height=400&width=600",
    views: 100,
    likes: 10,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json(video)
}
