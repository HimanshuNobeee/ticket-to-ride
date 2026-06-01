import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  setPlayerReady,
  startGame,
  selectInitialTickets,
  drawTrainCard,
  drawDestinationTicketsAction,
  chooseDestinationTickets,
  claimRouteAction,
  getGame,
  deleteRoom,
  setMapType
} from './gameManager.js';

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'OK', time: new Date() });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for easier local / network gameplay testing
    methods: ['GET', 'POST']
  }
});

const socketToPlayerMap: Record<string, { roomId: string; playerId: string }> = {};
const roomDeletionTimeouts: Record<string, NodeJS.Timeout> = {};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. Create Room
  socket.on('create-room', ({ playerId, playerName, playerColor }, callback) => {
    // Generate a random 4-letter code
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const game = createRoom(roomId);
    joinRoom(roomId, playerId, playerName, playerColor);
    
    socket.join(roomId);
    socketToPlayerMap[socket.id] = { roomId, playerId };
    console.log(`Room ${roomId} created by player ${playerName} (${playerId})`);
    
    if (callback) callback({ status: 'success', game });
  });

  // 2. Join Room
  socket.on('join-room', ({ roomId, playerId, playerName, playerColor }, callback) => {
    const code = roomId.toUpperCase();
    const game = getGame(code);
    if (!game) {
      if (callback) callback({ status: 'error', message: 'Room not found' });
      return;
    }

    const result = joinRoom(code, playerId, playerName, playerColor);
    if (!result) {
      if (callback) callback({ status: 'error', message: 'Could not join room' });
      return;
    }

    socket.join(code);
    socketToPlayerMap[socket.id] = { roomId: code, playerId };

    // Clear delete timeout if active
    if (roomDeletionTimeouts[code]) {
      clearTimeout(roomDeletionTimeouts[code]);
      delete roomDeletionTimeouts[code];
      console.log(`Room ${code} deletion timeout cancelled - player rejoined.`);
    }

    console.log(`Player ${playerName} joined Room ${code}`);

    // Notify all players in room
    io.to(code).emit('game-updated', result);
    
    if (callback) callback({ status: 'success', game: result });
  });

  // 3. Toggle Ready
  socket.on('toggle-ready', ({ roomId, playerId, isReady }) => {
    const code = roomId.toUpperCase();
    const game = setPlayerReady(code, playerId, isReady);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 3b. Select Map Type
  socket.on('select-map', ({ roomId, mapType }) => {
    const code = roomId.toUpperCase();
    const game = setMapType(code, mapType);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 4. Start Game
  socket.on('start-game', ({ roomId }) => {
    const code = roomId.toUpperCase();
    const game = startGame(code);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 5. Select Initial Destination Tickets
  socket.on('select-initial-tickets', ({ roomId, playerId, keptTicketIds }) => {
    const code = roomId.toUpperCase();
    const game = selectInitialTickets(code, playerId, keptTicketIds);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 6. Draw Train Card (face-up index or -1 for deck)
  socket.on('draw-card', ({ roomId, playerId, cardIndex }) => {
    const code = roomId.toUpperCase();
    const game = drawTrainCard(code, playerId, cardIndex);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 7. Request to Draw Destination Tickets
  socket.on('draw-destination-tickets', ({ roomId, playerId }) => {
    const code = roomId.toUpperCase();
    const game = drawDestinationTicketsAction(code, playerId);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 8. Choose Destination Tickets to Keep (from mid-game draw)
  socket.on('choose-destination-tickets', ({ roomId, playerId, keptTicketIds }) => {
    const code = roomId.toUpperCase();
    const game = chooseDestinationTickets(code, playerId, keptTicketIds);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 9. Claim Route
  socket.on('claim-route', ({ roomId, playerId, routeId, cardColor }) => {
    const code = roomId.toUpperCase();
    const game = claimRouteAction(code, playerId, routeId, cardColor);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 10. Disconnect/Leave Room
  socket.on('leave-room', ({ roomId, playerId }) => {
    const code = roomId.toUpperCase();
    const game = leaveRoom(code, playerId);
    socket.leave(code);
    delete socketToPlayerMap[socket.id];
    if (game) {
      // Check if room is empty, delete if it is
      const activeCount = game.players.filter(p => p.isConnected).length;
      if (activeCount === 0) {
        deleteRoom(code);
        console.log(`Room ${code} deleted because it is empty.`);
      } else {
        io.to(code).emit('game-updated', game);
      }
    }
  });

  socket.on('disconnecting', () => {
    // Leave all rooms socket was in
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        // Find player details or just mark them disconnected
        // We will do a broad check on game state since we don't map socket ID to player ID here directly
        // Instead, the client emits leave-room cleanly, or on raw disconnect, the server can detect rooms
        // For local development, this simple leave hook works nicely
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const mapping = socketToPlayerMap[socket.id];
    if (mapping) {
      const { roomId, playerId } = mapping;
      delete socketToPlayerMap[socket.id];

      // Check if there's any other tab/socket still open for this player
      const isPlayerStillConnected = Object.entries(socketToPlayerMap).some(
        ([sid, map]) => sid !== socket.id && map.roomId === roomId && map.playerId === playerId
      );

      if (!isPlayerStillConnected) {
        const game = leaveRoom(roomId, playerId);
        if (game) {
          const activeCount = game.players.filter(p => p.isConnected).length;
          if (activeCount === 0) {
            // Start a deletion timer for 60 seconds
            if (!roomDeletionTimeouts[roomId]) {
              roomDeletionTimeouts[roomId] = setTimeout(() => {
                deleteRoom(roomId);
                delete roomDeletionTimeouts[roomId];
                console.log(`Room ${roomId} deleted after being empty for 60 seconds.`);
              }, 60000);
              console.log(`Room ${roomId} is empty. Scheduling deletion in 60s...`);
            }
          } else {
            io.to(roomId).emit('game-updated', game);
          }
        }
      } else {
        console.log(`Player ${playerId} disconnected a duplicate connection. Main connection remains active.`);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
