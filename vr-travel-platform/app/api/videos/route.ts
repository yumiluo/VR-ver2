import { NextResponse } from "next/server"
import type { Video } from "@/lib/api"

// In-memory storage for demo purposes
// In production, this would connect to a real database
const videos: Video[] = [
  {
    id: "tokyo-360",
    title: "Tokyo Street View 360°",
    description:
      "Experience the bustling streets of Shibuya and explore Tokyo's urban landscape in immersive 360° video.",
    duration: "15:30",
    location: "Tokyo, Japan",
    thumbnail: "/placeholder.svg?height=200&width=300",
    src: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.jpg", // 360° image as fallback
    views: 1250,
    likes: 89,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "paris-360",
    title: "Paris Landmarks 360°",
    description:
      "Tour the iconic landmarks of Paris including the Eiffel Tower, Louvre, and Notre-Dame in stunning 360° detail.",
    duration: "12:45",
    location: "Paris, France",
    thumbnail: "/placeholder.svg?height=200&width=300",
    src: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/cubes.jpg", // 360° image
    views: 2100,
    likes: 156,
    createdAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "bali-360",
    title: "Bali Beaches 360°",
    description: "Relax on the pristine beaches of Bali and experience the tropical paradise in immersive 360° video.",
    duration: "18:20",
    location: "Bali, Indonesia",
    thumbnail: "/placeholder.svg?height=200&width=300",
    src: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/sechelt.jpg", // 360° beach image
    views: 890,
    likes: 67,
    createdAt: "2024-01-20T09:15:00Z",
  },
  {
    id: "nyc-360",
    title: "New York City 360°",
    description: "Explore the concrete jungle of Manhattan and experience the energy of NYC in 360° video.",
    duration: "14:10",
    location: "New York, USA",
    thumbnail: "/placeholder.svg?height=200&width=300",
    src: "https://ucarecdn.com/bcece0ea-7b99-4c47-8e9f-5c1a4b2c6b84/", // 360° NYC image
    views: 1680,
    likes: 124,
    createdAt: "2024-01-08T16:45:00Z",
  },
  {
    id: "iceland-360",
    title: "Iceland Northern Lights 360°",
    description:
      "Witness the magical Aurora Borealis dancing across Iceland's pristine landscapes in breathtaking 360° video.",
    duration: "20:15",
    location: "Iceland",
    thumbnail: "/placeholder.svg?height=200&width=300",
    src: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/forest.jpg", // 360° nature image
    views: 3200,
    likes: 245,
    createdAt: "2024-01-25T11:20:00Z",
  },
  {
    id: "maldives-360",
    title: "Maldives Underwater 360°",
    description:
      "Dive into the crystal-clear waters of the Maldives and explore vibrant coral reefs in immersive 360° underwater footage.",
    duration: "16:40",
    location: "Maldives",
    thumbnail: "/placeholder.svg?height=200&width=300",
    src: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/puydesancy.jpg", // 360° landscape image
    views: 1890,
    likes: 178,
    createdAt: "2024-01-18T13:45:00Z",
  },
]

export async function GET() {
  return NextResponse.json(videos)
}
