import express from "express";
import http from "http";
import path from "path";
import { Server, Socket } from "socket.io";
import { createServer as createViteServer } from "vite";

interface PlayerState {
  id: string;
  name: string;
  x: number;
  z: number;
  rotation: number;
  vehicle: 'harvester' | 'tractor' | 'truck';
  score: number;
  harvestCount: number;
  equipmentLevel: number;
  color: string;
}

interface RoomState {
  id: string;
  players: Record<string, PlayerState>;
  trees: Record<number, { harvested: boolean; resetTime: number }>;
  timeLeft: number;
  active: boolean;
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Rooms store
const rooms: Record<string, RoomState> = {};

function createRoom(roomId: string): RoomState {
  const trees: Record<number, { harvested: boolean; resetTime: number }> = {};
  // Create 40 trees in plantation layout
  for (let i = 0; i < 40; i++) {
    trees[i] = { harvested: false, resetTime: 0 };
  }

  const room: RoomState = {
    id: roomId,
    players: {},
    trees,
    timeLeft: 180, // 3 minutes match
    active: true
  };

  rooms[roomId] = room;
  return room;
}

// Global game room loop
setInterval(() => {
  const now = Date.now();
  for (const roomId in rooms) {
    const room = rooms[roomId];
    if (!room.active) continue;

    // Respawn trees after 15 seconds
    for (const treeId in room.trees) {
      const tree = room.trees[treeId];
      if (tree.harvested && now > tree.resetTime) {
        tree.harvested = false;
        io.to(roomId).emit("tree-respawned", { treeId: Number(treeId) });
      }
    }

    // Tick match timer
    if (room.timeLeft > 0) {
      room.timeLeft -= 1;
      if (room.timeLeft % 5 === 0) {
        io.to(roomId).emit("timer-sync", { timeLeft: room.timeLeft });
      }
    } else {
      // Match finished
      io.to(roomId).emit("match-over", {
        players: Object.values(room.players).sort((a, b) => b.score - a.score)
      });
      // Reset match timer after 10s cooldown
      room.timeLeft = 180;
    }
  }
}, 1000);

const PLAYER_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

io.on("connection", (socket: Socket) => {
  console.log(`[Socket] Player connected: ${socket.id}`);

  let currentRoomId = "global-arena";

  socket.on("join-room", (data: { roomId?: string; playerName?: string }) => {
    const roomId = data.roomId || "global-arena";
    currentRoomId = roomId;

    socket.join(roomId);

    if (!rooms[roomId]) {
      createRoom(roomId);
    }

    const room = rooms[roomId];
    const color = PLAYER_COLORS[Object.keys(room.players).length % PLAYER_COLORS.length];

    const newPlayer: PlayerState = {
      id: socket.id,
      name: data.playerName || `Pemanen_${socket.id.substring(0, 4)}`,
      x: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 40,
      rotation: 0,
      vehicle: "harvester",
      score: 0,
      harvestCount: 0,
      equipmentLevel: 1,
      color
    };

    room.players[socket.id] = newPlayer;

    // Send initial room sync
    socket.emit("room-joined", {
      roomId,
      playerId: socket.id,
      roomState: room
    });

    // Notify others
    socket.to(roomId).emit("player-joined", newPlayer);
  });

  socket.on("player-move", (data: { x: number; z: number; rotation: number; vehicle?: 'harvester' | 'tractor' | 'truck' }) => {
    const room = rooms[currentRoomId];
    if (!room || !room.players[socket.id]) return;

    const p = room.players[socket.id];
    p.x = data.x;
    p.z = data.z;
    p.rotation = data.rotation;
    if (data.vehicle) p.vehicle = data.vehicle;

    // Broadcast to others in room
    socket.to(currentRoomId).emit("player-moved", {
      id: socket.id,
      x: p.x,
      z: p.z,
      rotation: p.rotation,
      vehicle: p.vehicle
    });
  });

  socket.on("harvest-action", (data: { treeId: number; qualityBonus: number }) => {
    const room = rooms[currentRoomId];
    if (!room) return;

    const tree = room.trees[data.treeId];
    if (tree && !tree.harvested) {
      tree.harvested = true;
      tree.resetTime = Date.now() + 15000; // 15 seconds to respawn

      const p = room.players[socket.id];
      if (p) {
        const addedScore = Math.round(100 * (data.qualityBonus || 1.0));
        p.score += addedScore;
        p.harvestCount += 1;

        io.to(currentRoomId).emit("harvest-success", {
          playerId: socket.id,
          playerName: p.name,
          treeId: data.treeId,
          scoreGained: addedScore,
          totalScore: p.score,
          harvestCount: p.harvestCount
        });
      }
    }
  });

  socket.on("chat-msg", (text: string) => {
    const room = rooms[currentRoomId];
    if (!room) return;

    const p = room.players[socket.id];
    const name = p ? p.name : "Pemanen";
    io.to(currentRoomId).emit("chat-broadcast", {
      senderId: socket.id,
      senderName: name,
      text: text.substring(0, 80),
      timestamp: Date.now()
    });
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Player disconnected: ${socket.id}`);
    const room = rooms[currentRoomId];
    if (room && room.players[socket.id]) {
      delete room.players[socket.id];
      io.to(currentRoomId).emit("player-left", { id: socket.id });
    }
  });
});

async function start() {
  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Sawit Clash 3D" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sawit Clash 3D Server] Running at http://0.0.0.0:${PORT}`);
  });
}

start();
