import { WebSocketServer } from "ws"

const PORT = 8080
const wss = new WebSocketServer({ port: PORT })

// Store rooms and their participants
const rooms = new Map()

console.log(`WebSocket server running on ws://localhost:${PORT}`)

wss.on("connection", (ws) => {
  console.log("New client connected")

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log("Received:", message)

      switch (message.type) {
        case "join-room":
          handleJoinRoom(ws, message)
          break
        case "leave-room":
          handleLeaveRoom(ws, message)
          break
        case "video-sync":
        case "chat-message":
          handleBroadcastToRoom(ws, message)
          break
        default:
          console.log("Unknown message type:", message.type)
      }
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  })

  ws.on("close", () => {
    console.log("Client disconnected")
    // Clean up user from all rooms
    for (const [roomId, room] of rooms.entries()) {
      room.participants = room.participants.filter((p) => p.ws !== ws)
      if (room.participants.length === 0) {
        rooms.delete(roomId)
        console.log(`Room ${roomId} deleted (empty)`)
      }
    }
  })
})

function handleJoinRoom(ws, message) {
  const { roomId, user } = message

  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      participants: [],
      host: null,
      videoState: {
        isPlaying: false,
        currentTime: 0,
        videoId: null,
      },
    })
  }

  const room = rooms.get(roomId)

  // Set first user as host
  if (room.participants.length === 0) {
    room.host = user.id
  }

  // Add user to room
  room.participants.push({
    ...user,
    ws: ws,
    isHost: user.id === room.host,
  })

  // Store room info on websocket for cleanup
  ws.roomId = roomId
  ws.userId = user.id

  // Send room state to new user
  ws.send(
    JSON.stringify({
      type: "room-joined",
      roomId,
      participants: room.participants.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isHost: p.isHost,
      })),
      videoState: room.videoState,
      isHost: user.id === room.host,
    }),
  )

  // Notify other participants
  broadcastToRoom(
    roomId,
    {
      type: "user-joined",
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: user.id === room.host,
      },
    },
    ws,
  )

  console.log(`User ${user.name} joined room ${roomId}`)
}

function handleLeaveRoom(ws, message) {
  const { roomId, userId } = message

  if (rooms.has(roomId)) {
    const room = rooms.get(roomId)
    room.participants = room.participants.filter((p) => p.id !== userId)

    // Notify other participants
    broadcastToRoom(roomId, {
      type: "user-left",
      userId,
    })

    // If room is empty, delete it
    if (room.participants.length === 0) {
      rooms.delete(roomId)
      console.log(`Room ${roomId} deleted (empty)`)
    }

    console.log(`User ${userId} left room ${roomId}`)
  }
}

function handleBroadcastToRoom(ws, message) {
  const roomId = ws.roomId
  if (roomId) {
    broadcastToRoom(roomId, message, ws)
  }
}

function broadcastToRoom(roomId, message, excludeWs = null) {
  if (rooms.has(roomId)) {
    const room = rooms.get(roomId)
    room.participants.forEach((participant) => {
      if (participant.ws !== excludeWs && participant.ws.readyState === 1) {
        participant.ws.send(JSON.stringify(message))
      }
    })
  }
}
