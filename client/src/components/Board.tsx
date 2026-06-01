import React, { useState } from 'react';
import { CITIES } from '../utils/gameData.js';
import type { GameState, Route, CardColor, RouteColor } from '../utils/gameData.js';
import { USA_CITIES } from '../utils/usaMapData.js';
import { Sparkles, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface BoardProps {
  playerId: string;
  gameState: GameState;
  claimRoute: (routeId: string, cardColor: CardColor) => void;
  setError: (err: string | null) => void;
  highlightedCities: string[];
}

const getHexColor = (color: RouteColor): string => {
  switch (color) {
    case 'RED': return '#ef4444';
    case 'BLUE': return '#3b82f6';
    case 'GREEN': return '#10b981';
    case 'YELLOW': return '#f59e0b';
    case 'BLACK': return '#4b5563'; // Slate-gray representing black tracks
    case 'ORANGE': return '#f97316';
    case 'WHITE': return '#e2e8f0';
    case 'PURPLE': return '#a855f7';
    case 'LOCOMOTIVE': return '#38bdf8';
    case 'GREY': return '#64748b';
    default: return '#64748b';
  }
};

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
  length: number;
}

const getRouteSegments = (x1: number, y1: number, x2: number, y2: number, count: number): Segment[] => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const totalLength = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const segments: Segment[] = [];
  const gap = 4;
  const segmentLength = (totalLength - gap * (count + 1)) / count;

  for (let i = 0; i < count; i++) {
    const tStart = (gap + i * (segmentLength + gap)) / totalLength;
    const tEnd = (gap + i * (segmentLength + gap) + segmentLength) / totalLength;

    const sx1 = x1 + dx * tStart;
    const sy1 = y1 + dy * tStart;
    const sx2 = x1 + dx * tEnd;
    const sy2 = y1 + dy * tEnd;

    segments.push({
      x1: sx1,
      y1: sy1,
      x2: sx2,
      y2: sy2,
      angle,
      length: segmentLength
    });
  }

  return segments;
};

export const Board: React.FC<BoardProps> = ({
  playerId,
  gameState,
  claimRoute,
  setError,
  highlightedCities
}) => {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<Route | null>(null);
  const [claimingColor, setClaimingColor] = useState<CardColor | ''>('');

  // 1. Pan and Zoom States
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);

  const isClassic = gameState.mapType === 'CLASSIC_USA';
  const activeCities = isClassic ? USA_CITIES : CITIES;
  const self = gameState.players.find(p => p.id === playerId);
  const activePlayer = gameState.players[gameState.turnIndex];
  const isMyTurn = activePlayer?.id === playerId && gameState.gameStage === 'PLAYING';

  // Choose dimension constraints based on the active map type
  // Classic USA is wider/taller (1220x920) than Express (1020x620)
  const mapWidth = isClassic ? 1220 : 1020;
  const mapHeight = isClassic ? 920 : 620;

  const getCityCoords = (name: string) => {
    const city = activeCities.find(c => c.name === name);
    return city ? { x: city.x, y: city.y } : { x: 0, y: 0 };
  };

  const handleRouteClick = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation();
    if (dragDistance > 6) return; // Ignore clicks if panning occurred

    if (!isMyTurn) {
      setError("It's not your turn!");
      return;
    }
    if (route.claimedBy) {
      setError("This route is already claimed.");
      return;
    }
    if (self && self.trainsLeft < route.length) {
      setError(`Not enough trains left! You need ${route.length} trains.`);
      return;
    }

    setSelectedRoute(route);
    setClaimingColor(route.color === 'GREY' ? '' : (route.color as CardColor));
  };

  const executeClaim = () => {
    if (!selectedRoute || !claimingColor) return;
    claimRoute(selectedRoute.id, claimingColor);
    setSelectedRoute(null);
    setClaimingColor('');
  };

  const getGreyClaimOptions = (): CardColor[] => {
    if (!self || !selectedRoute || selectedRoute.color !== 'GREY') return [];
    const colors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'ORANGE', 'WHITE', 'PURPLE'];
    return colors.filter(c => {
      const matchCards = self.cards[c] || 0;
      const wildcards = self.cards['LOCOMOTIVE'] || 0;
      return matchCards + wildcards >= selectedRoute.length;
    });
  };

  // 2. Pan and Zoom Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only trigger for left clicks / primary touches
    setIsPanning(true);
    setStartPoint({ x: e.clientX - panX, y: e.clientY - panY });
    setDragDistance(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const dx = e.clientX - startPoint.x;
    const dy = e.clientY - startPoint.y;
    setPanX(dx);
    setPanY(dy);
    setDragDistance(prev => prev + Math.abs(e.movementX) + Math.abs(e.movementY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomIntensity = 0.08;
    let nextScale = scale;
    if (e.deltaY < 0) {
      nextScale = Math.min(scale + zoomIntensity, 3); // Max zoom 3x
    } else {
      nextScale = Math.max(scale - zoomIntensity, 0.6); // Min zoom 0.6x
    }
    setScale(nextScale);
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.6));
  const resetView = () => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* SVG Board Map Container with Mouse and Touch event capture */}
      <div
        className="glass-panel"
        style={{
          overflow: 'hidden',
          padding: '10px',
          background: 'rgba(9, 13, 22, 0.9)',
          cursor: isPanning ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            backgroundColor: '#0c1322',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.03)'
          }}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" />
            </pattern>
            <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0b0f19" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />
          <circle cx={mapWidth / 2} cy={mapHeight / 2} r={mapWidth / 2.2} fill="url(#map-glow)" />

          {/* Group wrapper applying translation and scaling vectors */}
          <g transform={`translate(${panX}, ${panY}) scale(${scale})`}>
            
            {/* Draw Dotted Flight-Path connection for Highlighted Destination Tickets */}
            {highlightedCities.length === 2 && (() => {
              const c1 = getCityCoords(highlightedCities[0]);
              const c2 = getCityCoords(highlightedCities[1]);
              if (c1.x === 0 || c2.x === 0) return null;
              return (
                <line
                  x1={c1.x + 10}
                  y1={c1.y + 10}
                  x2={c2.x + 10}
                  y2={c2.y + 10}
                  stroke="#fbbf24"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  opacity="0.8"
                  style={{
                    filter: 'drop-shadow(0 0 8px #fbbf24)',
                    pointerEvents: 'none'
                  }}
                />
              );
            })()}

            {/* Draw Connection Routes */}
            {gameState.routes.map((route: Route) => {
              const c1 = getCityCoords(route.city1);
              const c2 = getCityCoords(route.city2);
              if (c1.x === 0 || c2.x === 0) return null;

              // Check offset for parallel double routes to prevent visual overlap
              // We check if there's another route connecting the exact same cities
              const siblingRoutes = gameState.routes.filter(
                r => (r.city1 === route.city1 && r.city2 === route.city2) ||
                     (r.city1 === route.city2 && r.city2 === route.city1)
              );
              
              let offsetX = 0;
              let offsetY = 0;

              if (siblingRoutes.length === 2) {
                // Calculate line perpendicular direction to shift parallel lines apart
                const dx = c2.x - c1.x;
                const dy = c2.y - c1.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const px = -dy / len; // Perpendicular vector
                const py = dx / len;
                
                const shiftDist = 8; // Pixels offset
                const routeIndex = siblingRoutes.findIndex(r => r.id === route.id);
                const shiftDir = routeIndex === 0 ? 1 : -1;
                offsetX = px * shiftDist * shiftDir;
                offsetY = py * shiftDist * shiftDir;
              }

              const segments = getRouteSegments(
                c1.x + 10 + offsetX, 
                c1.y + 10 + offsetY, 
                c2.x + 10 + offsetX, 
                c2.y + 10 + offsetY, 
                route.length
              );
              
              const isHovered = hoveredRoute?.id === route.id;
              const isClaimed = route.claimedBy !== null;
              const claimer = isClaimed ? gameState.players.find(p => p.id === route.claimedBy) : null;
              const trackColor = isClaimed && claimer ? claimer.color : getHexColor(route.color);

              return (
                <g
                  key={route.id}
                  style={{ cursor: isClaimed ? 'default' : 'pointer' }}
                  onClick={(e) => handleRouteClick(e, route)}
                  onMouseEnter={() => !isClaimed && setHoveredRoute(route)}
                  onMouseLeave={() => setHoveredRoute(null)}
                >
                  {/* Invisible pointer hover target area */}
                  <line
                    x1={c1.x + 10 + offsetX}
                    y1={c1.y + 10 + offsetY}
                    x2={c2.x + 10 + offsetX}
                    y2={c2.y + 10 + offsetY}
                    stroke="transparent"
                    strokeWidth="18"
                  />

                  {/* Draw train track segment rectangles */}
                  {segments.map((seg, i) => (
                    <rect
                      key={i}
                      x={-seg.length / 2}
                      y={-6}
                      width={seg.length}
                      height={12}
                      rx={2}
                      transform={`translate(${(seg.x1 + seg.x2) / 2}, ${(seg.y1 + seg.y2) / 2}) rotate(${seg.angle})`}
                      fill={trackColor}
                      stroke={isHovered ? '#ffffff' : (isClaimed ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.06)')}
                      strokeWidth={isHovered ? 1.5 : (isClaimed ? 0.8 : 0.4)}
                      style={{
                        transition: 'stroke 0.2s, stroke-width 0.2s',
                        filter: isHovered || isClaimed ? `drop-shadow(0 0 3px ${trackColor})` : 'none',
                        opacity: isClaimed ? 1 : 0.7
                      }}
                    />
                  ))}

                  {/* Visual wheel stripes inside claimed trains */}
                  {isClaimed && segments.map((seg, i) => (
                    <line
                      key={`line-${i}`}
                      x1={-seg.length / 4}
                      y1={0}
                      x2={seg.length / 4}
                      y2={0}
                      transform={`translate(${(seg.x1 + seg.x2) / 2}, ${(seg.y1 + seg.y2) / 2}) rotate(${seg.angle})`}
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  ))}
                </g>
              );
            })}

            {/* Draw City Pins */}
            {activeCities.map(city => {
              const isHighlighted = highlightedCities.includes(city.name);

              return (
                <g key={city.name} transform={`translate(${city.x + 10}, ${city.y + 10})`}>
                  {/* Glowing Pulse Ring for current ticket selections */}
                  {isHighlighted && (
                    <circle
                      r="18"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      style={{
                        filter: 'drop-shadow(0 0 6px #fbbf24)',
                        animation: 'pulse-glow 1.2s infinite'
                      }}
                    />
                  )}
                  {/* Subtle hover city circle */}
                  <circle
                    r="9"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1"
                    opacity="0.25"
                  />
                  {/* Core city pin */}
                  <circle
                    r="5"
                    fill={isHighlighted ? '#fbbf24' : '#1e293b'}
                    stroke={isHighlighted ? '#ffffff' : '#60a5fa'}
                    strokeWidth={isHighlighted ? 2.5 : 2}
                    style={{
                      filter: isHighlighted 
                        ? 'drop-shadow(0 0 8px #fbbf24)' 
                        : 'drop-shadow(0 0 3px rgba(96, 165, 250, 0.45))',
                      cursor: 'help'
                    }}
                  />
                  {/* Shadow Text label */}
                  <text
                    y="-11"
                    textAnchor="middle"
                    fill="#000000"
                    fontSize="10"
                    fontWeight="800"
                    style={{ pointerEvents: 'none', opacity: 0.8 }}
                  >
                    {city.name}
                  </text>
                  {/* Foreground Text label */}
                  <text
                    y="-11"
                    textAnchor="middle"
                    fill={isHighlighted ? '#fbbf24' : '#ffffff'}
                    fontSize="10"
                    fontWeight={isHighlighted ? '700' : '500'}
                    style={{ pointerEvents: 'none', fontFamily: 'Outfit, sans-serif' }}
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating map pan & zoom visual controls */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 10
        }}
      >
        <button
          onClick={zoomIn}
          className="btn-secondary"
          style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.85)' }}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={zoomOut}
          className="btn-secondary"
          style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.85)' }}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={resetView}
          className="btn-secondary"
          style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.85)' }}
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Floating details overlay on hover */}
      {hoveredRoute && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            padding: '12px 18px',
            pointerEvents: 'none',
            borderLeft: `4px solid ${getHexColor(hoveredRoute.color)}`,
            background: 'rgba(15, 23, 42, 0.92)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <MapPin size={16} color="#60a5fa" />
            <span style={{ fontWeight: '700', fontSize: '15px' }}>{hoveredRoute.city1} to {hoveredRoute.city2}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', gap: '16px' }}>
            <span>Tracks: <strong style={{ color: '#fff' }}>{hoveredRoute.length}</strong></span>
            <span>Color: <strong style={{ color: getHexColor(hoveredRoute.color) }}>{hoveredRoute.color}</strong></span>
            <span>Points: <strong style={{ color: '#10b981' }}>{hoveredRoute.length === 6 ? 15 : hoveredRoute.length === 5 ? 10 : hoveredRoute.length === 4 ? 7 : hoveredRoute.length === 3 ? 4 : hoveredRoute.length === 2 ? 2 : 1}</strong></span>
          </div>
        </div>
      )}

      {/* Route Claiming Modal */}
      {selectedRoute && self && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedRoute(null)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: '28px',
              width: '100%',
              maxWidth: '440px',
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>Claim Railway Route</h3>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
              Connect <strong style={{ color: '#fff' }}>{selectedRoute.city1}</strong> and <strong style={{ color: '#fff' }}>{selectedRoute.city2}</strong>. 
              Requires <strong style={{ color: getHexColor(selectedRoute.color) }}>{selectedRoute.length} {selectedRoute.color.toLowerCase()} tracks</strong>.
            </p>

            {selectedRoute.color === 'GREY' ? (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '10px' }}>
                  Select card color to use:
                </label>
                {getGreyClaimOptions().length === 0 ? (
                  <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>
                    You don't have enough matching cards of any single color + wildcards to claim this.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {getGreyClaimOptions().map(color => (
                      <button
                        key={color}
                        className={`btn-secondary ${claimingColor === color ? 'text-glow' : ''}`}
                        onClick={() => setClaimingColor(color)}
                        style={{
                          padding: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          border: claimingColor === color ? `2px solid ${getHexColor(color)}` : '1px solid rgba(255,255,255,0.05)',
                          background: claimingColor === color ? 'rgba(255, 255, 255, 0.05)' : undefined
                        }}
                      >
                        <span style={{ color: getHexColor(color), fontWeight: '600' }}>{color}</span>
                        <span style={{ color: '#94a3b8' }}>({self.cards[color] || 0})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Specific route color
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '24px' }}>
                <div>
                  <span style={{ color: getHexColor(selectedRoute.color as CardColor), fontWeight: '700', textTransform: 'capitalize' }}>
                    {selectedRoute.color.toLowerCase()} Cards
                  </span>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '13px', marginTop: '2px' }}>
                    Cost: {selectedRoute.length} cards
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '600' }}>
                    Have: {self.cards[selectedRoute.color as CardColor] || 0} + {self.cards['LOCOMOTIVE'] || 0} Wildcards
                  </span>
                  <span style={{ display: 'block', fontSize: '13px', color: '#10b981', marginTop: '2px' }}>
                    {(self.cards[selectedRoute.color as CardColor] || 0) + (self.cards['LOCOMOTIVE'] || 0) >= selectedRoute.length ? '✅ Available' : '❌ Insufficient'}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedRoute(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={executeClaim}
                disabled={
                  !claimingColor ||
                  (selectedRoute.color !== 'GREY' &&
                    (self.cards[selectedRoute.color as CardColor] || 0) + (self.cards['LOCOMOTIVE'] || 0) < selectedRoute.length)
                }
              >
                <Sparkles size={16} /> Claim Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
