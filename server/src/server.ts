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
  setMapType,
  kickPlayer,
  skipPlayerTurn,
  cleanupExpiredGamesAction,
  confirmTunnelClaimAction,
  cancelTunnelClaimAction,
  placeStationAction
} from './gameManager.js';
import { initDb, getTopHighScoresFromDb } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'OK', time: new Date() });
});

// Root welcome message
app.get('/', (req, res) => {
  res.send({ message: 'Ticket to Ride Server is Running. Please play the game at: https://t2r-mp-673f2a.web.app' });
});

// GET High Scores leaderboard
app.get('/api/highscores', async (req, res) => {
  try {
    const scores = await getTopHighScoresFromDb();
    res.json({ status: 'success', scores });
  } catch (err) {
    console.error("Error serving high scores:", err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve high scores' });
  }
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
const ROOM_DELETION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours (86,400,000 ms)

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. Create Room
  socket.on('create-room', async ({ playerId, playerName, playerColor }, callback) => {
    // Generate a random 4-letter code
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const game = await createRoom(roomId);
    const result = await joinRoom(roomId, playerId, playerName, playerColor);
    
    socket.join(roomId);
    socketToPlayerMap[socket.id] = { roomId, playerId };
    console.log(`Room ${roomId} created by player ${playerName} (${playerId})`);
    
    if (callback) callback({ status: 'success', game: result || game });
  });

  // 2. Join Room
  socket.on('join-room', async ({ roomId, playerId, playerName, playerColor }, callback) => {
    const code = roomId.toUpperCase();
    const game = await getGame(code);
    if (!game) {
      if (callback) callback({ status: 'error', message: 'Room not found' });
      return;
    }

    const result = await joinRoom(code, playerId, playerName, playerColor);
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
  socket.on('toggle-ready', async ({ roomId, playerId, isReady }) => {
    const code = roomId.toUpperCase();
    const game = await setPlayerReady(code, playerId, isReady);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 3b. Select Map Type
  socket.on('select-map', async ({ roomId, mapType }) => {
    const code = roomId.toUpperCase();
    const game = await setMapType(code, mapType);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 4. Start Game
  socket.on('start-game', async ({ roomId }) => {
    const code = roomId.toUpperCase();
    const game = await startGame(code);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 5. Select Initial Destination Tickets
  socket.on('select-initial-tickets', async ({ roomId, playerId, keptTicketIds }) => {
    const code = roomId.toUpperCase();
    const game = await selectInitialTickets(code, playerId, keptTicketIds);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 6. Draw Train Card (face-up index or -1 for deck)
  socket.on('draw-card', async ({ roomId, playerId, cardIndex }) => {
    const code = roomId.toUpperCase();
    const game = await drawTrainCard(code, playerId, cardIndex);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 7. Request to Draw Destination Tickets
  socket.on('draw-destination-tickets', async ({ roomId, playerId }) => {
    const code = roomId.toUpperCase();
    const game = await drawDestinationTicketsAction(code, playerId);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 8. Choose Destination Tickets to Keep (from mid-game draw)
  socket.on('choose-destination-tickets', async ({ roomId, playerId, keptTicketIds }) => {
    const code = roomId.toUpperCase();
    const game = await chooseDestinationTickets(code, playerId, keptTicketIds);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 9. Claim Route
  socket.on('claim-route', async ({ roomId, playerId, routeId, cardColor }) => {
    const code = roomId.toUpperCase();
    const game = await claimRouteAction(code, playerId, routeId, cardColor);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 9b. Confirm Tunnel Claim
  socket.on('confirm-tunnel-claim', async ({ roomId, playerId }) => {
    const code = roomId.toUpperCase();
    const game = await confirmTunnelClaimAction(code, playerId);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 9c. Cancel Tunnel Claim
  socket.on('cancel-tunnel-claim', async ({ roomId, playerId }) => {
    const code = roomId.toUpperCase();
    const game = await cancelTunnelClaimAction(code, playerId);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 9d. Place Train Station
  socket.on('place-station', async ({ roomId, playerId, cityName, cardColor }) => {
    const code = roomId.toUpperCase();
    const game = await placeStationAction(code, playerId, cityName, cardColor);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  // 10. Disconnect/Leave Room
  socket.on('leave-room', async ({ roomId, playerId }) => {
    const code = roomId.toUpperCase();
    const game = await leaveRoom(code, playerId);
    socket.leave(code);
    delete socketToPlayerMap[socket.id];
    if (game) {
      // Check if room is empty, schedule deletion in 24 hours if it is
      const activeCount = game.players.filter(p => p.isConnected).length;
      if (activeCount === 0) {
        if (!roomDeletionTimeouts[code]) {
          roomDeletionTimeouts[code] = setTimeout(async () => {
            await deleteRoom(code);
            delete roomDeletionTimeouts[code];
            console.log(`Room ${code} deleted after being empty for 24 hours.`);
          }, ROOM_DELETION_TIMEOUT);
          console.log(`Room ${code} is empty. Scheduling deletion in 24 hours...`);
        }
      } else {
        io.to(code).emit('game-updated', game);
      }
    }
  });

  socket.on('kick-player', async ({ roomId, playerId, targetPlayerId }) => {
    const code = roomId.toUpperCase();
    const game = await kickPlayer(code, playerId, targetPlayerId);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  socket.on('skip-player-turn', async ({ roomId, playerId, targetPlayerId }) => {
    const code = roomId.toUpperCase();
    const game = await skipPlayerTurn(code, playerId, targetPlayerId);
    if (game) {
      io.to(code).emit('game-updated', game);
    }
  });

  socket.on('disconnecting', () => {
    // Leave all rooms socket was in
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        // Find player details or just mark them disconnected
      }
    }
  });

  socket.on('disconnect', async () => {
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
        const game = await leaveRoom(roomId, playerId);
        if (game) {
          const activeCount = game.players.filter(p => p.isConnected).length;
          if (activeCount === 0) {
            // Start a deletion timer for 24 hours
            if (!roomDeletionTimeouts[roomId]) {
              roomDeletionTimeouts[roomId] = setTimeout(async () => {
                await deleteRoom(roomId);
                delete roomDeletionTimeouts[roomId];
                console.log(`Room ${roomId} deleted after being empty for 24 hours.`);
              }, ROOM_DELETION_TIMEOUT);
              console.log(`Room ${roomId} is empty. Scheduling deletion in 24 hours...`);
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
initDb().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
  });
  
  // Run room cleanup check every 30 minutes to clean up empty expired rooms in the database
  setInterval(async () => {
    try {
      console.log("⏰ Running scheduled empty room database cleanup check...");
      await cleanupExpiredGamesAction();
    } catch (err) {
      console.error("Failed to run scheduled empty room cleanup:", err);
    }
  }, 30 * 60 * 1000);
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
