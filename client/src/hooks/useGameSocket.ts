import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { GameState, CardColor } from '../utils/gameData.js';

// Setup dynamic socket server URL based on the current hostname or Vite env variable
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalhost ? 'http://localhost:3001' : 'https://ticket-to-ride-jkyl.onrender.com';
};

// Unique player ID generator saved in localStorage
const getOrCreatePlayerId = (): string => {
  let id = localStorage.getItem('t2r_player_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('t2r_player_id', id);
  }
  return id;
};

export const useGameSocket = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const playerId = getOrCreatePlayerId();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = getSocketUrl();
    console.log(`Connecting socket to: ${url}`);
    const newSocket = io(url, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to game server.');

      // Auto-reconnect if we were in an active room
      const savedRoomId = localStorage.getItem('t2r_room_id');
      const savedName = localStorage.getItem('t2r_player_name');
      const savedColor = localStorage.getItem('t2r_player_color');
      if (savedRoomId && savedName && savedColor) {
        console.log(`Auto-rejoining room: ${savedRoomId}`);
        newSocket.emit(
          'join-room',
          { roomId: savedRoomId, playerId, playerName: savedName, playerColor: savedColor },
          (res: { status: string; game?: GameState; message?: string }) => {
            if (res.status === 'success' && res.game) {
              setGameState(res.game);
              setError(null);
            } else {
              console.log(`Failed to auto-rejoin: ${res.message || 'Room not found'}`);
              localStorage.removeItem('t2r_room_id');
            }
          }
        );
      }
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
      setError(`Could not connect to game server at: ${url}`);
    });

    newSocket.on('game-updated', (updatedState: GameState) => {
      const selfPlayer = updatedState.players.find(p => p.id === playerId);
      if (!selfPlayer || selfPlayer.isKicked) {
        console.log('You have been kicked by the host.');
        localStorage.removeItem('t2r_room_id');
        setGameState(null);
        setError('You have been kicked from the room by the host.');
        return;
      }
      setGameState(updatedState);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createRoom = (playerName: string, playerColor: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(
      'create-room',
      { playerId, playerName, playerColor },
      (res: { status: string; game?: GameState; message?: string }) => {
        if (res.status === 'success' && res.game) {
          localStorage.setItem('t2r_room_id', res.game.roomId);
          localStorage.setItem('t2r_player_name', playerName);
          const selfPlayer = res.game.players.find(p => p.id === playerId);
          localStorage.setItem('t2r_player_color', selfPlayer ? selfPlayer.color : playerColor);
          setGameState(res.game);
          setError(null);
        } else {
          setError(res.message || 'Failed to create room.');
        }
      }
    );
  };

  const joinRoom = (roomId: string, playerName: string, playerColor: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(
      'join-room',
      { roomId: roomId.toUpperCase(), playerId, playerName, playerColor },
      (res: { status: string; game?: GameState; message?: string }) => {
        if (res.status === 'success' && res.game) {
          localStorage.setItem('t2r_room_id', res.game.roomId);
          localStorage.setItem('t2r_player_name', playerName);
          const selfPlayer = res.game.players.find(p => p.id === playerId);
          localStorage.setItem('t2r_player_color', selfPlayer ? selfPlayer.color : playerColor);
          setGameState(res.game);
          setError(null);
        } else {
          setError(res.message || 'Failed to join room.');
        }
      }
    );
  };

  const toggleReady = (isReady: boolean) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('toggle-ready', { roomId: gameState.roomId, playerId, isReady });
  };

  const selectMap = (mapType: 'CLASSIC_USA' | 'EXPRESS_USA' | 'EUROPE' | 'INDIA') => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('select-map', { roomId: gameState.roomId, mapType });
  };

  const startGame = () => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('start-game', { roomId: gameState.roomId });
  };

  const selectInitialTickets = (keptTicketIds: string[]) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('select-initial-tickets', {
      roomId: gameState.roomId,
      playerId,
      keptTicketIds
    });
  };

  const drawTrainCard = (cardIndex: number) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('draw-card', {
      roomId: gameState.roomId,
      playerId,
      cardIndex
    });
  };

  const drawDestinationTickets = () => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('draw-destination-tickets', {
      roomId: gameState.roomId,
      playerId
    });
  };

  const chooseDestinationTickets = (keptTicketIds: string[]) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('choose-destination-tickets', {
      roomId: gameState.roomId,
      playerId,
      keptTicketIds
    });
  };

  const claimRoute = (routeId: string, cardColor: CardColor) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('claim-route', {
      roomId: gameState.roomId,
      playerId,
      routeId,
      cardColor
    });
  };

  const leaveRoom = () => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('leave-room', { roomId: gameState.roomId, playerId });
    localStorage.removeItem('t2r_room_id');
    setGameState(null);
  };

  const kickPlayer = (targetPlayerId: string) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('kick-player', { roomId: gameState.roomId, playerId, targetPlayerId });
  };

  const skipPlayerTurn = (targetPlayerId: string) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('skip-player-turn', { roomId: gameState.roomId, playerId, targetPlayerId });
  };

  return {
    playerId,
    gameState,
    error,
    isConnected,
    createRoom,
    joinRoom,
    toggleReady,
    selectMap,
    startGame,
    selectInitialTickets,
    drawTrainCard,
    drawDestinationTickets,
    chooseDestinationTickets,
    claimRoute,
    leaveRoom,
    kickPlayer,
    skipPlayerTurn,
    setError
  };
};
