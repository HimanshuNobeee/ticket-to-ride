import React, { useState } from 'react';
import type { GameState } from '../utils/gameData.js';
import { User, ShieldAlert, Sparkles, LogOut, CheckCircle2, Circle } from 'lucide-react';

interface LobbyProps {
  playerId: string;
  gameState: GameState | null;
  createRoom: (name: string, color: string) => void;
  joinRoom: (roomId: string, name: string, color: string) => void;
  toggleReady: (ready: boolean) => void;
  selectMap: (mapType: 'CLASSIC_USA' | 'EXPRESS_USA') => void;
  startGame: () => void;
  leaveRoom: () => void;
  kickPlayer: (playerId: string) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

const PLAYER_COLORS = [
  { name: 'Blue Glow', hex: '#3b82f6' },
  { name: 'Red Flare', hex: '#ef4444' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Amethyst', hex: '#a855f7' }
];

export const Lobby: React.FC<LobbyProps> = ({
  playerId,
  gameState,
  createRoom,
  joinRoom,
  toggleReady,
  selectMap,
  startGame,
  leaveRoom,
  kickPlayer,
  error,
  setError
}) => {
  const [name, setName] = useState(() => localStorage.getItem('t2r_player_name') || '');
  const [selectedColor, setSelectedColor] = useState(() => localStorage.getItem('t2r_player_color') || PLAYER_COLORS[0].hex);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isJoinMode, setIsJoinMode] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a nickname.');
      return;
    }
    createRoom(name.trim(), selectedColor);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a nickname.');
      return;
    }
    if (!roomIdInput.trim()) {
      setError('Please enter a room code.');
      return;
    }
    joinRoom(roomIdInput.trim(), name.trim(), selectedColor);
  };

  // If in active room but not playing yet, show the lobby waiting screen
  if (gameState && gameState.gameStage === 'LOBBY') {
    const self = gameState.players.find(p => p.id === playerId);
    const hostPlayer = gameState.players.find(p => p.isConnected);
    const isHost = hostPlayer?.id === playerId;
    const allReady = gameState.players.length >= 2 && gameState.players.every((p) => p.isReady || p.id === hostPlayer?.id);

    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '600px', margin: '60px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>Lobby Code</span>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#60a5fa', margin: '4px 0 0 0', textShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
              {gameState.roomId}
            </h2>
          </div>
          <button className="btn-secondary" onClick={leaveRoom} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
            <LogOut size={16} /> Leave
          </button>
        </div>

        {/* Map Selection Option */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
          {isHost ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Game Board Map (Host Settings)
              </label>
              <select
                value={gameState.mapType}
                onChange={(e) => selectMap(e.target.value as 'CLASSIC_USA' | 'EXPRESS_USA')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <option value="EXPRESS_USA">Express USA Map (20 cities, faster game)</option>
                <option value="CLASSIC_USA">Classic USA Map (38 cities, official replica)</option>
              </select>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Active Game Board Map
              </span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#60a5fa' }}>
                {gameState.mapType === 'CLASSIC_USA' ? 'Classic USA Map (38 cities)' : 'Express USA Map (20 cities)'}
              </span>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#e2e8f0', marginBottom: '12px' }}>Players in Lobby</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gameState.players.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${p.id === playerId ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                  <span style={{ fontWeight: p.id === playerId ? '600' : '400', color: p.isConnected ? '#f8fafc' : '#64748b' }}>
                    {p.name} {p.id === playerId && '(You)'} {p.id === hostPlayer?.id && '👑'}
                    {!p.isConnected && ' (Offline)'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isHost && p.id !== playerId && (
                    <button
                      onClick={() => kickPlayer(p.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#f87171',
                        fontSize: '11px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        marginRight: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      title="Kick Player"
                    >
                      Kick
                    </button>
                  )}
                  {p.isReady ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
                      <CheckCircle2 size={16} /> Ready
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px' }}>
                      <Circle size={16} /> Waiting
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button
            className={`btn-primary`}
            style={{
              flex: 1,
              backgroundColor: self?.isReady ? '#64748b' : '#10b981',
              boxShadow: self?.isReady ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.3)',
              background: self?.isReady ? 'rgba(255, 255, 255, 0.08)' : undefined,
              border: self?.isReady ? '1px solid rgba(255,255,255,0.1)' : undefined
            }}
            onClick={() => toggleReady(!self?.isReady)}
          >
            {self?.isReady ? 'Cancel Ready' : 'Ready Up'}
          </button>

          {isHost && (
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={startGame}
              disabled={!allReady}
            >
              <Sparkles size={18} /> Start Adventure
            </button>
          )}
        </div>

        {isHost && !allReady && (
          <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '12px' }}>
            {gameState.players.length < 2
              ? 'Waiting for at least 2 players to join...'
              : 'Waiting for all players to click Ready.'}
          </p>
        )}
      </div>
    );
  }

  // Lobby setup / initial entrance screen
  return (
    <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-1px', background: 'linear-gradient(to right, #3b82f6, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          TICKET TO RIDE
        </h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '8px' }}>
          Real-time Cross-Country Rail Adventure
        </p>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '24px' }}>
          <button
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: !isJoinMode ? '2px solid #3b82f6' : 'none',
              color: !isJoinMode ? '#f8fafc' : '#94a3b8',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={() => { setIsJoinMode(false); setError(null); }}
          >
            Create Room
          </button>
          <button
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: isJoinMode ? '2px solid #3b82f6' : 'none',
              color: isJoinMode ? '#f8fafc' : '#94a3b8',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={() => { setIsJoinMode(true); setError(null); }}
          >
            Join Room
          </button>
        </div>

        <form onSubmit={isJoinMode ? handleJoin : handleCreate}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Nickname</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={15}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Choose Train Color</label>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              {PLAYER_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: selectedColor === c.hex ? '3px solid white' : '1px solid rgba(0,0,0,0.3)',
                    boxShadow: selectedColor === c.hex ? `0 0 12px ${c.hex}` : 'none',
                    cursor: 'pointer',
                    transform: selectedColor === c.hex ? 'scale(1.15)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {isJoinMode && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Room Code</label>
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700',
                  letterSpacing: '3px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {isJoinMode ? 'Join Game Session' : 'Create Game Lobby'}
          </button>
        </form>
      </div>
    </div>
  );
};
