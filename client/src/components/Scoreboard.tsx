import React from 'react';
import type { GameState, Route, DestinationTicket } from '../utils/gameData.js';
import { Trophy, Users, Award, Shield } from 'lucide-react';

const isTicketConnected = (playerRoutes: Route[], ticket: DestinationTicket): boolean => {
  const adj: Record<string, string[]> = {};
  for (const r of playerRoutes) {
    if (!adj[r.city1]) adj[r.city1] = [];
    if (!adj[r.city2]) adj[r.city2] = [];
    adj[r.city1].push(r.city2);
    adj[r.city2].push(r.city1);
  }
  
  const visited = new Set<string>();
  const queue: string[] = [ticket.city1];
  visited.add(ticket.city1);
  
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === ticket.city2) return true;
    
    for (const neighbor of adj[curr] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
};

interface ScoreboardProps {
  playerId: string;
  gameState: GameState;
  onHighlightCities?: (cities: string[]) => void;
  onKickPlayer?: (playerId: string) => void;
  onSkipPlayerTurn?: (playerId: string) => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  playerId,
  gameState,
  onHighlightCities,
  onKickPlayer,
  onSkipPlayerTurn
}) => {
  // Sort players by score descending
  const sortedPlayers = [...gameState.players].sort((a, b) => b.points - a.points);
  const activePlayer = gameState.players[gameState.turnIndex];

  // Host is defined dynamically as the first connected player
  const hostPlayer = gameState.players.find(p => p.isConnected);
  const isHost = hostPlayer?.id === playerId;

  return (
    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.65)' }}>
      <h3 style={{ fontSize: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <Users size={18} color="#3b82f6" /> Scoreboard & Leaderboard
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sortedPlayers.map((p, index) => {
          const isActive = activePlayer?.id === p.id && gameState.gameStage !== 'GAME_OVER' && gameState.gameStage !== 'INITIAL_DRAW';
          const isSelf = p.id === playerId;
          const isWinner = gameState.winnerId === p.id && gameState.gameStage === 'GAME_OVER';
          const hasLongestRoute = gameState.longestRoutePlayerId === p.id && gameState.gameStage === 'GAME_OVER';

          // Count cards in hand
          const cardCount = Object.values(p.cards).reduce((a, b) => a + b, 0);

          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: isActive
                  ? 'rgba(59, 130, 246, 0.08)'
                  : isSelf
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(255, 255, 255, 0.01)',
                border: isActive
                  ? '1px solid rgba(59, 130, 246, 0.3)'
                  : isSelf
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(255, 255, 255, 0.03)',
                boxShadow: isActive ? '0 0 15px rgba(59, 130, 246, 0.1)' : 'none',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Turn indicator glow line */}
              {isActive && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#3b82f6', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }} />
              )}

              {/* Player identity and Rank */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', minWidth: '16px' }}>
                    #{index + 1}
                  </div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                  <span style={{
                    fontWeight: isSelf || isActive ? '600' : '400',
                    color: p.isConnected ? '#f8fafc' : '#64748b',
                    fontSize: '15px'
                  }}>
                    {p.name} {isSelf && '(You)'} {p.id === hostPlayer?.id && '👑'}
                    {!p.isConnected && ' (Offline)'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isWinner && (
                    <Trophy size={16} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
                  )}
                  {hasLongestRoute && (
                    <span title="Longest continuous path bonus!"><Award size={16} color="#10b981" /></span>
                  )}
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: isActive ? '#3b82f6' : '#fff',
                    fontFamily: 'Outfit, sans-serif'
                  }}>
                    {p.points}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>pts</span>
                </div>
              </div>

              {/* Player Asset inventories */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px', marginTop: '2px' }}>
                <span title="Trains Remaining">
                  🚂 <strong style={{ color: p.trainsLeft <= 5 ? '#ef4444' : '#f1f5f9' }}>{p.trainsLeft}</strong> cars left
                </span>
                <span title="Cards in Hand">
                  🎴 <strong>{cardCount}</strong> cards
                </span>
                <span title="Tickets Held">
                  🎫 <strong>{p.destinationTickets.length}</strong> tickets
                </span>
              </div>

              {/* If game is over, show completed/failed destination tickets */}
              {gameState.gameStage === 'GAME_OVER' && p.destinationTickets.length > 0 && (
                <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.5px', marginBottom: '2px' }}>
                    Destination Tickets:
                  </div>
                  {p.destinationTickets.map(t => {
                    const playerRoutes = gameState.routes.filter(r => r.claimedBy === p.id);
                    const connected = isTicketConnected(playerRoutes, t);
                    return (
                      <div
                        key={t.id}
                        onMouseEnter={() => onHighlightCities && onHighlightCities([t.city1, t.city2])}
                        onMouseLeave={() => onHighlightCities && onHighlightCities([])}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: connected ? '#10b981' : '#ef4444',
                          cursor: onHighlightCities ? 'help' : 'default',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          transition: 'background 0.2s ease'
                        }}
                        className="hover-bg-opacity"
                      >
                        <span>
                          {connected ? '✅' : '❌'} {t.city1} to {t.city2}
                        </span>
                        <strong style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {connected ? `+${t.points}` : `-${t.points}`} pts
                        </strong>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action State / Warning alerts */}
              {isActive && (
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Shield size={12} />
                  <span>Thinking... Current player's turn</span>
                </div>
              )}

              {/* Host Controls for managing other players */}
              {isHost && !isSelf && gameState.gameStage !== 'GAME_OVER' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                  {isActive && (
                    <button
                      onClick={() => onSkipPlayerTurn?.(p.id)}
                      style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '4px',
                        color: '#60a5fa',
                        fontSize: '10px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        transition: 'all 0.2s ease'
                      }}
                      title="Skip player's turn"
                    >
                      Skip Turn
                    </button>
                  )}
                  <button
                    onClick={() => onKickPlayer?.(p.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      color: '#f87171',
                      fontSize: '10px',
                      padding: '3px 8px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      transition: 'all 0.2s ease'
                    }}
                    title="Kick player from game"
                  >
                    Kick
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
