"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Users, Plus, Search, Clock, MapPin, Play, Lock, Unlock } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { LanguageSelector } from "@/components/language-selector"
import { fetchRooms, fetchVideos, createRoom, joinRoom, type Room, type Video, type CreateRoomRequest } from "@/lib/api"

export default function RoomsPage() {
  const { t } = useI18n()
  const [rooms, setRooms] = useState<Room[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRoom, setNewRoom] = useState<CreateRoomRequest>({
    name: "",
    description: "",
    videoId: "",
    maxParticipants: 10,
    isPrivate: false,
    password: "",
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [roomsData, videosData] = await Promise.all([fetchRooms(), fetchVideos()])
      setRooms(roomsData)
      setVideos(videosData)
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "waiting" && room.status === "waiting") ||
      (filterStatus === "watching" && room.status === "watching") ||
      (filterStatus === "public" && !room.isPrivate) ||
      (filterStatus === "private" && room.isPrivate)

    return matchesSearch && matchesFilter
  })

  const handleCreateRoom = async () => {
    const createdRoom = await createRoom(newRoom)
    if (createdRoom) {
      setRooms((prev) => [...prev, createdRoom])
      setIsCreateDialogOpen(false)
      setNewRoom({
        name: "",
        description: "",
        videoId: "",
        maxParticipants: 10,
        isPrivate: false,
        password: "",
      })
    }
  }

  const handleJoinRoom = async (roomId: string, isPrivate: boolean) => {
    const success = await joinRoom(roomId, isPrivate ? "password" : undefined)
    if (success) {
      window.location.href = `/watch/${roomId}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-muted-foreground">Loading rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Globe className="h-8 w-8 text-primary" />
                <span className="font-sans font-bold text-xl text-sidebar-foreground">VR Travel Group</span>
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-sidebar-foreground hover:text-sidebar-primary">
                  {t.home}
                </Button>
              </Link>
              <Button variant="ghost" className="text-sidebar-foreground hover:text-sidebar-primary">
                {t.myRooms}
              </Button>
              <LanguageSelector />
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createRoom}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-sans">{t.createNewRoom}</DialogTitle>
                    <DialogDescription className="font-serif">
                      Set up a new room for synchronized VR viewing with friends
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="room-name" className="font-serif">
                        {t.roomName}
                      </Label>
                      <Input
                        id="room-name"
                        placeholder={t.enterRoomName}
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="room-description" className="font-serif">
                        {t.description}
                      </Label>
                      <Textarea
                        id="room-description"
                        placeholder={t.describeRoom}
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-select" className="font-serif">
                        {t.selectVideo}
                      </Label>
                      <Select
                        value={newRoom.videoId}
                        onValueChange={(value) => setNewRoom({ ...newRoom, videoId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.chooseDestination} />
                        </SelectTrigger>
                        <SelectContent>
                          {videos.map((video) => (
                            <SelectItem key={video.id} value={video.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{video.title}</span>
                                <span className="text-muted-foreground text-sm ml-2">{video.duration}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="max-participants" className="font-serif">
                        {t.maxParticipants}
                      </Label>
                      <Select
                        value={newRoom.maxParticipants.toString()}
                        onValueChange={(value) => setNewRoom({ ...newRoom, maxParticipants: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 8, 10, 12, 15, 20].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {t.participants}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private-room"
                        checked={newRoom.isPrivate}
                        onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                        className="rounded border-border"
                      />
                      <Label htmlFor="private-room" className="font-serif">
                        {t.privateRoom}
                      </Label>
                    </div>
                    {newRoom.isPrivate && (
                      <div>
                        <Label htmlFor="room-password" className="font-serif">
                          {t.password}
                        </Label>
                        <Input
                          id="room-password"
                          type="password"
                          placeholder={t.enterPassword}
                          value={newRoom.password}
                          onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                        {t.cancel}
                      </Button>
                      <Button onClick={handleCreateRoom} className="flex-1 bg-primary hover:bg-primary/90">
                        {t.createRoom}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-sans text-3xl font-bold text-foreground mb-2">VR Travel {t.rooms}</h1>
          <p className="font-serif text-lg text-muted-foreground">
            Join friends in synchronized 360° travel experiences around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchRooms}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allRooms}</SelectItem>
              <SelectItem value="waiting">{t.waitingToStart}</SelectItem>
              <SelectItem value="watching">{t.currentlyWatching}</SelectItem>
              <SelectItem value="public">{t.publicRooms}</SelectItem>
              <SelectItem value="private">{t.privateRooms}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="group hover:shadow-lg transition-all border-border">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={room.videoThumbnail || "/placeholder.svg"}
                  alt={room.videoTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge
                    variant={room.status === "watching" ? "default" : "secondary"}
                    className="bg-black/50 text-white border-0"
                  >
                    {room.status === "watching" ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        {t.watching}
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        {t.waiting}
                      </>
                    )}
                  </Badge>
                  {room.isPrivate && (
                    <Badge variant="secondary" className="bg-black/50 text-white border-0">
                      <Lock className="h-3 w-3 mr-1" />
                      {t.private}
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-black/50 text-white border-0">
                    {room.videoDuration}
                  </Badge>
                </div>
                {room.status === "watching" && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-black/50 rounded px-2 py-1">
                      <div className="flex items-center justify-between text-white text-xs">
                        <span>
                          {Math.floor(room.currentTime / 60)}:{(room.currentTime % 60).toString().padStart(2, "0")}
                        </span>
                        <div className="flex-1 mx-2 bg-white/20 rounded-full h-1">
                          <div
                            className="bg-primary h-1 rounded-full"
                            style={{
                              width: `${(room.currentTime / (Number.parseInt(room.videoDuration.split(":")[0]) * 60 + Number.parseInt(room.videoDuration.split(":")[1]))) * 100}%`,
                            }}
                          />
                        </div>
                        <span>{room.videoDuration}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-sans text-lg mb-1">{room.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <MapPin className="h-3 w-3" />
                      <span className="font-serif">{room.location}</span>
                    </div>
                  </div>
                  {room.isPrivate ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Unlock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <CardDescription className="font-serif text-sm line-clamp-2">{room.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={room.hostAvatar || "/placeholder.svg"} alt={room.hostName} />
                      <AvatarFallback className="text-xs">
                        {room.hostName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-serif text-sm text-muted-foreground">
                      {t.hostedBy} {room.hostName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-serif text-sm">
                      {room.participants}/{room.maxParticipants}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleJoinRoom(room.id, room.isPrivate)}
                    disabled={room.participants >= room.maxParticipants}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {room.participants >= room.maxParticipants ? t.full : t.joinRoom}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-sans text-lg font-semibold text-foreground mb-2">{t.noRoomsFound}</h3>
            <p className="font-serif text-muted-foreground mb-4">{searchQuery ? t.adjustSearch : t.beFirstToCreate}</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.createRoom}
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}
