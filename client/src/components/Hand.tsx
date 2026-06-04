import React, { useState, useEffect, useRef } from 'react';
import type { GameState, CardColor, Route, DestinationTicket } from '../utils/gameData.js';
import { Landmark, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

interface HandProps {
  playerId: string;
  gameState: GameState;
  onHighlightCities?: (cities: string[]) => void;
}

// Convert card colors to nice hex values for card tags
const getHexColor = (color: CardColor): string => {
  switch (color) {
    case 'RED': return '#ef4444';
    case 'BLUE': return '#3b82f6';
    case 'GREEN': return '#10b981';
    case 'YELLOW': return '#eab308';
    case 'BLACK': return '#17171a';
    case 'ORANGE': return '#f97316';
    case 'WHITE': return '#ffffff';
    case 'PURPLE': return '#a855f7';
    case 'LOCOMOTIVE': return '#38bdf8';
    default: return '#64748b';
  }
};

// Local path checking helper
const isTicketConnected = (playerRoutes: Route[], ticket: DestinationTicket): boolean => {
  const adj: Record<string, string[]> = {};
  for (const r of playerRoutes) {
    if (!adj[r.city1]) adj[r.city1] = [];
    if (!adj[r.city2]) adj[r.city2] = [];
    adj[r.city1].push(r.city2);
    adj[r.city2].push(r.city1);
  }

  const visited = new Set<string>();
  const queue = [ticket.city1];
  visited.add(ticket.city1);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === ticket.city2) return true;
    for (const neighbor of (adj[curr] || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
};

export const Hand: React.FC<HandProps> = ({ playerId, gameState, onHighlightCities }) => {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return null;

  const playerRoutes = gameState.routes.filter((r: Route) => r.claimedBy === playerId);

  // Bump animation state when cards increase
  const prevCountsRef = useRef<Record<string, number>>({});
  const [bumpedColors, setBumpedColors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!player || !player.cards) return;
    const nextBumped: Record<string, boolean> = {};
    let changed = false;

    // First time load: just store counts
    if (Object.keys(prevCountsRef.current).length === 0) {
      for (const [color, count] of Object.entries(player.cards)) {
        prevCountsRef.current[color] = count;
      }
      return;
    }

    for (const [color, count] of Object.entries(player.cards)) {
      const prev = prevCountsRef.current[color] || 0;
      if (count > prev) {
        nextBumped[color] = true;
        changed = true;
      }
      prevCountsRef.current[color] = count;
    }

    if (changed) {
      setBumpedColors(prev => ({ ...prev, ...nextBumped }));
      setTimeout(() => {
        setBumpedColors(prev => {
          const next = { ...prev };
          for (const color of Object.keys(nextBumped)) {
            delete next[color];
          }
          return next;
        });
      }, 700); // Match cardCountBump animation duration
    }
  }, [player.cards]);

  const cardList: { color: CardColor; count: number }[] = [
    { color: 'RED', count: player.cards['RED'] || 0 },
    { color: 'BLUE', count: player.cards['BLUE'] || 0 },
    { color: 'GREEN', count: player.cards['GREEN'] || 0 },
    { color: 'YELLOW', count: player.cards['YELLOW'] || 0 },
    { color: 'BLACK', count: player.cards['BLACK'] || 0 },
    { color: 'ORANGE', count: player.cards['ORANGE'] || 0 },
    { color: 'WHITE', count: player.cards['WHITE'] || 0 },
    { color: 'PURPLE', count: player.cards['PURPLE'] || 0 },
    { color: 'LOCOMOTIVE', count: player.cards['LOCOMOTIVE'] || 0 }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', width: '100%' }}>
      {/* 1. Train Cards Hand */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.65)' }}>
        <h3 style={{ fontSize: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <Landmark size={18} color="#3b82f6" /> Train Inventory ({Object.values(player.cards).reduce((a, b) => a + b, 0)} cards)
        </h3>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cardList.map(({ color, count }) => {
            const hex = getHexColor(color);
            const isWhite = color === 'WHITE';
            const isYellow = color === 'YELLOW';
            const hasGlow = count > 0;

            return (
              <div
                key={color}
                className={bumpedColors[color] ? 'card-bump-animate' : ''}
                style={{
                  position: 'relative',
                  width: '56px',
                  height: '80px',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: color === 'LOCOMOTIVE' 
                    ? 'linear-gradient(135deg, #ef4444 0%, #3b82f6 50%, #a855f7 100%)' 
                    : hex,
                  border: isWhite ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: hasGlow ? `0 4px 12px ${hex}40` : 'none',
                  opacity: count > 0 ? 1 : 0.25,
                  transform: count > 0 ? 'scale(1)' : 'scale(0.95)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  ['--bump-glow' as any]: hex
                }}
              >
                {/* Visual grid lines for playing card aesthetic */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', pointerEvents: 'none' }} />

                <span style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  color: isWhite || isYellow ? '#0f172a' : '#ffffff',
                  opacity: 0.9,
                  letterSpacing: '-0.2px'
                }}>
                  {color === 'LOCOMOTIVE' ? 'WILD' : color}
                </span>

                <span style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  lineHeight: '1',
                  textAlign: 'right',
                  color: isWhite || isYellow ? '#0f172a' : '#ffffff',
                  textShadow: isWhite || isYellow ? 'none' : '0 2px 4px rgba(0,0,0,0.4)',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Destination Tickets Hand */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.65)' }}>
        <h3 style={{ fontSize: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <Compass size={18} color="#a855f7" /> Destination Tickets ({player.destinationTickets.length})
        </h3>

        {player.destinationTickets.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            No tickets drawn yet. You'll receive starting tickets once everyone is ready!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {player.destinationTickets.map(ticket => {
              const connected = isTicketConnected(playerRoutes, ticket);

              return (
                <div
                  key={ticket.id}
                  onMouseEnter={() => onHighlightCities && onHighlightCities([ticket.city1, ticket.city2])}
                  onMouseLeave={() => onHighlightCities && onHighlightCities([])}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: connected ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255,255,255,0.05)',
                    borderLeft: `5px solid ${connected ? '#10b981' : '#64748b'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: connected ? '0 0 12px rgba(16, 185, 129, 0.05)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      <span style={{ color: '#fff', display: 'block' }}>{ticket.city1}</span>
                      <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block', margin: '2px 0' }}>to</span>
                      <span style={{ color: '#fff', display: 'block' }}>{ticket.city2}</span>
                    </div>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: connected ? '#10b981' : '#e2e8f0',
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      +{ticket.points}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: connected ? '#10b981' : '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {connected ? (
                      <>
                        <CheckCircle2 size={13} /> Route Completed
                      </>
                    ) : (
                      <>
                        <AlertCircle size={13} /> Incomplete (-{ticket.points} pts)
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
