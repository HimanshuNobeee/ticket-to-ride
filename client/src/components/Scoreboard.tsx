import React from 'react';
import type { GameState } from '../utils/gameData.js';
import { Trophy, Users, Award, Shield } from 'lucide-react';

interface ScoreboardProps {
  playerId: string;
  gameState: GameState;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ playerId, gameState }) => {
  // Sort players by score descending
  const sortedPlayers = [...gameState.players].sort((a, b) => b.points - a.points);
  const activePlayer = gameState.players[gameState.turnIndex];

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
                    {p.name} {isSelf && '(You)'}
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
                  🚂 <strong style={{ color: p.trainsLeft <= 5 ? '#ef4444' : '#f1f5f9' }}>{p.trainsLeft}</strong> left
                </span>
                <span title="Cards in Hand">
                  🎴 <strong>{cardCount}</strong> cards
                </span>
                <span title="Tickets Held">
                  🎫 <strong>{p.destinationTickets.length}</strong> tickets
                </span>
              </div>

              {/* Action State / Warning alerts */}
              {isActive && (
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Shield size={12} />
                  <span>Thinking... Current player's turn</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
