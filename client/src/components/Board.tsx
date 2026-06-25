import React, { useState, useRef, useEffect } from 'react';
import type { GameState, Route, CardColor, RouteColor, DestinationTicket } from '../utils/gameData.js';
import { USA_CITIES } from '../utils/usaMapData.js';
import { EUROPE_CITIES } from '../utils/europeMapData.js';
import { INDIA_CITIES } from '../utils/indiaMapData.js';
import { Sparkles, MapPin, ZoomIn, ZoomOut, RotateCcw, Lock, Unlock } from 'lucide-react';

interface BoardProps {
  playerId: string;
  gameState: GameState;
  claimRoute: (routeId: string, cardColor: CardColor) => void;
  setError: (err: string | null) => void;
  highlightedCities: string[];
  confirmTunnelClaim: () => void;
  cancelTunnelClaim: () => void;
  placeStation: (cityName: string, cardColor: CardColor) => void;
  isBuildingStation?: boolean;
  onCloseStationBuild?: () => void;
}

const getHexColor = (color: RouteColor): string => {
  switch (color) {
    case 'RED': return '#ef4444';
    case 'BLUE': return '#3b82f6';
    case 'GREEN': return '#10b981';
    case 'YELLOW': return '#eab308';
    case 'BLACK': return '#3f3f46';
    case 'ORANGE': return '#f97316';
    case 'WHITE': return '#ffffff';
    case 'PURPLE': return '#a855f7';
    case 'LOCOMOTIVE': return '#38bdf8';
    case 'GREY': return '#94a3b8';
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

const isTicketConnectedWithStations = (gameState: GameState, playerId: string, ticket: DestinationTicket): boolean => {
  const playerRoutes = gameState.routes.filter(r => r.claimedBy === playerId);
  if (gameState.mapType !== 'EUROPE') {
    return isTicketConnected(playerRoutes, ticket);
  }

  // Find all station cities placed by this player
  const stationCities: string[] = [];
  if (gameState.stations) {
    for (const [cityName, ownerId] of Object.entries(gameState.stations)) {
      if (ownerId === playerId) {
        stationCities.push(cityName);
      }
    }
  }

  if (stationCities.length === 0) {
    return isTicketConnected(playerRoutes, ticket);
  }

  // For each station city, find all opponent claimed routes incident to it
  const optionsPerStation: (Route | null)[][] = [];
  for (const city of stationCities) {
    const stationOptions: (Route | null)[] = [null];
    for (const r of gameState.routes) {
      if (r.claimedBy !== null && r.claimedBy !== playerId) {
        if (r.city1 === city || r.city2 === city) {
          if (!stationOptions.some(opt => opt && opt.id === r.id)) {
            stationOptions.push(r);
          }
        }
      }
    }
    optionsPerStation.push(stationOptions);
  }

  // Helper to generate Cartesian product
  function getCombinations(index: number, current: (Route | null)[]): (Route | null)[][] {
    if (index === optionsPerStation.length) {
      return [current];
    }
    const results: (Route | null)[][] = [];
    for (const opt of optionsPerStation[index]) {
      results.push(...getCombinations(index + 1, [...current, opt]));
    }
    return results;
  }

  const combinations = getCombinations(0, []);

  // Check if any combination connects the ticket!
  for (const combo of combinations) {
    const effectiveRoutes = [...playerRoutes];
    for (const r of combo) {
      if (r !== null) {
        effectiveRoutes.push(r);
      }
    }
    if (isTicketConnected(effectiveRoutes, ticket)) {
      return true;
    }
  }

  return false;
};

export const Board: React.FC<BoardProps> = ({
  playerId,
  gameState,
  claimRoute,
  setError,
  highlightedCities,
  confirmTunnelClaim,
  cancelTunnelClaim,
  placeStation,
  isBuildingStation,
  onCloseStationBuild
}) => {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<Route | null>(null);
  const [claimingColor, setClaimingColor] = useState<CardColor | ''>('');
  const [selectedCityForStation, setSelectedCityForStation] = useState<string | null>(null);
  const [stationPaymentColor, setStationPaymentColor] = useState<CardColor | ''>('');

  // Track newly claimed routes for popping animations
  const claimedRoutesRef = useRef<Set<string>>(new Set());
  const [animatingRoutes, setAnimatingRoutes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!gameState || !gameState.routes) return;
    const newAnimating: Record<string, boolean> = {};
    let changed = false;

    // First time load: populate without animating
    if (claimedRoutesRef.current.size === 0) {
      for (const r of gameState.routes) {
        if (r.claimedBy !== null) {
          claimedRoutesRef.current.add(r.id);
        }
      }
      return;
    }

    for (const r of gameState.routes) {
      if (r.claimedBy !== null) {
        if (!claimedRoutesRef.current.has(r.id)) {
          // This is a newly claimed route!
          newAnimating[r.id] = true;
          claimedRoutesRef.current.add(r.id);
          changed = true;
        }
      } else {
        if (claimedRoutesRef.current.has(r.id)) {
          claimedRoutesRef.current.delete(r.id);
        }
      }
    }

    if (changed) {
      setAnimatingRoutes(prev => ({ ...prev, ...newAnimating }));
      setTimeout(() => {
        setAnimatingRoutes(prev => {
          const next = { ...prev };
          for (const id of Object.keys(newAnimating)) {
            delete next[id];
          }
          return next;
        });
      }, 3500); // Remove animation classes after 3.5s
    }
  }, [gameState.routes]);

  // 1. Pan and Zoom States
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const startScreenPointRef = useRef({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState(true);

  const isEurope = gameState.mapType === 'EUROPE';
  const isIndia = gameState.mapType === 'INDIA';
  const activeCities = isIndia ? INDIA_CITIES : isEurope ? EUROPE_CITIES : USA_CITIES;
  const self = gameState.players.find(p => p.id === playerId);
  const activePlayer = gameState.players[gameState.turnIndex];
  const isMyTurn = activePlayer?.id === playerId && (gameState.gameStage === 'PLAYING' || gameState.gameStage === 'LAST_ROUND');

  // Get active player's claimed routes and ticket connection statuses
  const cityTicketStatuses: Record<string, { completed: boolean }[]> = {};
  const myIncompleteTicketCities: string[] = [];
  if (self?.destinationTickets) {
    self.destinationTickets.forEach(ticket => {
      const isConnected = isTicketConnectedWithStations(gameState, playerId, ticket);
      if (!isConnected) {
        myIncompleteTicketCities.push(ticket.city1, ticket.city2);
      }
      const cities = [ticket.city1, ticket.city2];
      cities.forEach(cityName => {
        if (!cityTicketStatuses[cityName]) {
          cityTicketStatuses[cityName] = [];
        }
        cityTicketStatuses[cityName].push({ completed: isConnected });
      });
    });
  }

  // Choose dimension constraints based on the active map type
  // Classic USA and Europe are wider/taller (1220x920)
  // India is temporarily set to 973x1050 to match the custom background image coordinates
  const mapWidth = isIndia ? 973 : 1220;
  const mapHeight = isIndia ? 1050 : 920;

  const getCityCoords = (name: string) => {
    const city = activeCities.find(c => c.name === name);
    return city ? { x: city.x, y: city.y } : { x: 0, y: 0 };
  };



  const executePlaceStation = () => {
    if (!selectedCityForStation || !stationPaymentColor) return;
    placeStation(selectedCityForStation, stationPaymentColor);
    setSelectedCityForStation(null);
    setStationPaymentColor('');
    onCloseStationBuild?.();
  };

  const getStationPaymentOptions = (): CardColor[] => {
    if (!selectedCityForStation) return [];
    const stationsLeft = activePlayer?.stationsLeft ?? 3;
    const cost = 4 - stationsLeft;

    const options: CardColor[] = [];
    const colors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'ORANGE', 'WHITE', 'PURPLE'];

    for (const c of colors) {
      const normal = activePlayer?.cards[c] || 0;
      const loco = activePlayer?.cards['LOCOMOTIVE'] || 0;
      if (normal + loco >= cost) {
        options.push(c);
      }
    }

    const loco = activePlayer?.cards['LOCOMOTIVE'] || 0;
    if (loco >= cost) {
      options.push('LOCOMOTIVE');
    }

    return options;
  };

  const handleRouteClick = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation();
    
    const dx = e.clientX - startScreenPointRef.current.x;
    const dy = e.clientY - startScreenPointRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (e.clientX !== 0 && e.clientY !== 0 && dist > 6) return; // Ignore clicks if panning occurred

    if (!isMyTurn) {
      setError("It's not your turn!");
      return;
    }
    const hasPendingTickets = (gameState as any).pendingTickets?.[playerId];
    if (hasPendingTickets) {
      setError("You must choose your destination tickets first!");
      return;
    }
    if (route.claimedBy) {
      setError("This route is already claimed.");
      return;
    }

    // Check double/parallel route constraints
    const siblingRoutes = gameState.routes.filter(
      r => (r.city1 === route.city1 && r.city2 === route.city2) ||
           (r.city1 === route.city2 && r.city2 === route.city1)
    );

    if (siblingRoutes.length === 2) {
      const otherRoute = siblingRoutes.find(r => r.id !== route.id);
      if (otherRoute && otherRoute.claimedBy !== null) {
        if (otherRoute.claimedBy === playerId) {
          setError("You cannot claim both routes of a double route.");
          return;
        }
      }
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
    const reqEngines = selectedRoute.requiredEngines || 0;
    const locomotivesAvailable = self.cards['LOCOMOTIVE'] || 0;
    if (locomotivesAvailable < reqEngines) return [];

    const colors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'ORANGE', 'WHITE', 'PURPLE'];
    return colors.filter(c => {
      const matchCards = self.cards[c] || 0;
      const remainingLocomotives = locomotivesAvailable - reqEngines;
      return matchCards + remainingLocomotives >= selectedRoute.length - reqEngines;
    });
  };

  // 2. Pan and Zoom Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only trigger for left clicks / primary touches
    startScreenPointRef.current = { x: e.clientX, y: e.clientY };
    if (isLocked) return;
    setIsPanning(true);
    setStartPoint({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLocked) return;
    if (!isPanning) return;
    const dx = e.clientX - startPoint.x;
    const dy = e.clientY - startPoint.y;
    setPanX(dx);
    setPanY(dy);
  };

  const handlePointerUp = () => {
    if (isLocked) return;
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isLocked) return;
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
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* SVG Board Map Container with Mouse and Touch event capture */}
      <div
        className="glass-panel"
        style={{
          overflow: 'hidden',
          padding: '10px',
          background: 'rgba(9, 13, 22, 0.9)',
          cursor: isLocked ? 'default' : (isPanning ? 'grabbing' : 'grab'),
          userSelect: 'none',
          touchAction: isLocked ? 'pan-y' : 'none',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0
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
            height: '100%',
            maxHeight: '100%',
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

                  {/* Draw train track segment elements */}
                  {segments.map((seg, i) => (
                    <g
                      key={i}
                      transform={`translate(${(seg.x1 + seg.x2) / 2}, ${(seg.y1 + seg.y2) / 2}) rotate(${seg.angle})`}
                    >
                      <g
                        className={animatingRoutes[route.id] ? 'train-segment-animate' : ''}
                        style={{
                          animationDelay: animatingRoutes[route.id] ? `${i * 120}ms` : undefined
                        }}
                      >
                        {/* Tunnel backdrop frame */}
                        {route.isTunnel && (
                          <>
                            {/* Base dark outline block */}
                            <rect
                              x={-seg.length / 2 - 2}
                              y={-8}
                              width={seg.length + 4}
                              height={16}
                              rx={4}
                              fill="rgba(15, 23, 42, 0.85)"
                              stroke="#475569"
                              strokeWidth={1.5}
                            />
                            {/* Inner dashed masonry line */}
                            <rect
                              x={-seg.length / 2 - 2}
                              y={-8}
                              width={seg.length + 4}
                              height={16}
                              rx={4}
                              fill="none"
                              stroke="#cbd5e1"
                              strokeWidth={0.8}
                              strokeDasharray="4 3"
                            />
                          </>
                        )}

                        {/* Base train track segment rectangle */}
                        <rect
                          x={-seg.length / 2}
                          y={-6}
                          width={seg.length}
                          height={12}
                          rx={2}
                          fill={trackColor}
                          stroke={isHovered ? '#ffffff' : (isClaimed ? 'rgba(0,0,0,0.6)' : (route.color === 'BLACK' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)'))}
                          strokeWidth={isHovered ? 1.5 : (isClaimed ? 1.2 : (route.color === 'BLACK' ? 0.95 : 0.6))}
                          style={{
                            transition: 'stroke 0.2s, stroke-width 0.2s',
                            filter: isHovered || isClaimed ? `drop-shadow(0 0 4px ${trackColor})` : 'none',
                            opacity: isClaimed ? 1 : (route.color === 'WHITE' ? 1.0 : 0.7)
                          }}
                        />

                        {/* Ferry Locomotive Icon */}
                        {!isClaimed && route.requiredEngines && i < route.requiredEngines && (() => {
                          const isDark = route.color === 'WHITE' || route.color === 'YELLOW';
                          const mainColor = isDark ? '#000000' : '#ffffff';
                          const detailColor = isDark ? '#ffffff' : '#000000';
                          return (
                            <g style={{ pointerEvents: 'none' }}>
                              {/* Steam Engine Body */}
                              <path
                                d="M -6,2 L -6,-2.5 L -3,-2.5 L -3,-1 L 2,-1 L 2,-3 L 3.5,-3 L 3.5,-1 L 5.5,-1 L 5.5,2 Z"
                                fill={mainColor}
                                opacity="0.85"
                              />
                              {/* Wheels */}
                              <circle cx="-3.5" cy="2.5" r="1.2" fill={detailColor} opacity="0.9" />
                              <circle cx="2.5" cy="2.5" r="1.2" fill={detailColor} opacity="0.9" />
                            </g>
                          );
                        })()}

                        {/* Train car detail overlays if claimed */}
                        {isClaimed && (
                          <>
                            {/* Central window panel strip */}
                            <rect
                              x={-seg.length / 2 + 3}
                              y={-3}
                              width={seg.length - 6}
                              height={4}
                              rx={1}
                              fill="rgba(0, 0, 0, 0.55)"
                            />
                            {/* Left Wheel */}
                            <circle
                              cx={-seg.length / 4}
                              cy={4.5}
                              r={1.8}
                              fill="rgba(0, 0, 0, 0.85)"
                              stroke="rgba(255, 255, 255, 0.25)"
                              strokeWidth={0.5}
                            />
                            {/* Right Wheel */}
                            <circle
                              cx={seg.length / 4}
                              cy={4.5}
                              r={1.8}
                              fill="rgba(0, 0, 0, 0.85)"
                              stroke="rgba(255, 255, 255, 0.25)"
                              strokeWidth={0.5}
                            />
                            {/* Train coupling line hooks */}
                            <line
                              x1={-seg.length / 2}
                              y1={0}
                              x2={-seg.length / 2 + 1.5}
                              y2={0}
                              stroke="rgba(255, 255, 255, 0.45)"
                              strokeWidth={1}
                            />
                            <line
                              x1={seg.length / 2 - 1.5}
                              y1={0}
                              x2={seg.length / 2}
                              y2={0}
                              stroke="rgba(255, 255, 255, 0.45)"
                              strokeWidth={1}
                            />
                          </>
                        )}
                      </g>
                    </g>
                  ))}
                </g>
              );
            })}

             {/* Draw City Pins */}
            {activeCities.map(city => {
              const isHighlighted = highlightedCities.includes(city.name);
              const statuses = cityTicketStatuses[city.name];
              const hasMyTicket = !!statuses;

              const stationOwnerId = gameState.stations?.[city.name];
              const stationOwner = stationOwnerId ? gameState.players.find(p => p.id === stationOwnerId) : null;
              const isClickable = false;

              return (
                <g 
                  key={city.name} 
                  transform={`translate(${city.x + 10}, ${city.y + 10})`}
                  style={{ cursor: isHighlighted ? 'help' : 'default' }}
                >
                  {/* Glowing Pulse Ring for current ticket selections */}
                  {isHighlighted && (
                    <circle
                      r="18"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      className="animate-svg-pulse"
                      style={{
                        filter: 'drop-shadow(0 0 6px #fbbf24)'
                      }}
                    />
                  )}
                  {/* Glowing Ring for player's owned destination tickets (gold if incomplete, green if completed) */}
                  {hasMyTicket && !isHighlighted && (() => {
                    const hasIncomplete = myIncompleteTicketCities.includes(city.name);
                    return (
                      <circle
                        r="14"
                        fill="none"
                        stroke={hasIncomplete ? '#fbbf24' : '#10b981'}
                        strokeWidth="2.2"
                        style={{
                          filter: `drop-shadow(0 0 5px ${hasIncomplete ? '#fbbf24' : '#10b981'})`,
                          opacity: 0.95
                        }}
                      />
                    );
                  })()}
                  {/* Dashed Gold Ring indicating station placement eligibility */}
                  {isClickable && (
                    <circle
                      r="12"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                      className="animate-svg-pulse"
                      style={{
                        opacity: 0.7,
                        filter: 'drop-shadow(0 0 4px #fbbf24)'
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
                      cursor: isClickable ? 'pointer' : (isHighlighted ? 'help' : 'default')
                    }}
                  />
                  {/* Placed Train Station House */}
                  {stationOwner && (
                    <g transform="translate(12, 12)" style={{ pointerEvents: 'none' }}>
                      <rect 
                        x="-6" 
                        y="-6" 
                        width="12" 
                        height="12" 
                        fill={stationOwner.color} 
                        rx="1.5" 
                        stroke="#ffffff" 
                        strokeWidth="1.2" 
                        style={{ filter: `drop-shadow(0 0 5px ${stationOwner.color})` }} 
                      />
                      <polygon 
                        points="-6,-6 0,-11 6,-6" 
                        fill={stationOwner.color} 
                        stroke="#ffffff" 
                        strokeWidth="1.2" 
                      />
                      <text 
                        x="0" 
                        y="3" 
                        fontSize="7" 
                        fontWeight="bold" 
                        fill="#ffffff" 
                        textAnchor="middle"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        S
                      </text>
                    </g>
                  )}
                  {/* Shadow Text label */}
                  <text
                    y="-13"
                    textAnchor="middle"
                    fill="#000000"
                    fontSize="12"
                    fontWeight="800"
                    style={{ pointerEvents: 'none', opacity: 0.8 }}
                  >
                    {city.name}
                  </text>
                  {/* Foreground Text label */}
                  <text
                    y="-13"
                    textAnchor="middle"
                    fill={isHighlighted ? '#fbbf24' : '#ffffff'}
                    fontSize="12"
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
          onClick={() => setIsLocked(!isLocked)}
          className="btn-secondary"
          style={{
            width: '36px',
            height: '36px',
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            background: isLocked ? 'rgba(239, 68, 68, 0.85)' : 'rgba(15, 23, 42, 0.85)',
            border: isLocked ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
            color: isLocked ? '#fff' : '#94a3b8',
            transition: 'all 0.2s ease'
          }}
          title={isLocked ? "Unlock Map Navigation" : "Lock Map Navigation"}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
        <button
          onClick={zoomIn}
          className="btn-secondary"
          style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.85)' }}
          title="Zoom In"
          disabled={isLocked}
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={zoomOut}
          className="btn-secondary"
          style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.85)' }}
          title="Zoom Out"
          disabled={isLocked}
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={resetView}
          className="btn-secondary"
          style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.85)' }}
          title="Reset View"
          disabled={isLocked}
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
          {(hoveredRoute.requiredEngines || 0) > 0 && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🚢 Ferry (Locomotives Required: {hoveredRoute.requiredEngines})</span>
            </div>
          )}
          {hoveredRoute.isTunnel && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#60a5fa', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🚇 Tunnel (Testing draws 3 cards)</span>
            </div>
          )}
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

            {selectedRoute.requiredEngines ? (
              <div style={{ marginBottom: '16px', padding: '8px 12px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', fontSize: '13px', color: '#fbbf24' }}>
                🚢 <strong>Ferry Route:</strong> Requires at least <strong>{selectedRoute.requiredEngines} Locomotive card(s)</strong>.
              </div>
            ) : null}
            {selectedRoute.isTunnel ? (
              <div style={{ marginBottom: '16px', padding: '8px 12px', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '8px', fontSize: '13px', color: '#60a5fa' }}>
                🚇 <strong>Tunnel Route:</strong> Claiming will test the tunnel by drawing 3 cards. Be prepared for potential extra costs!
              </div>
            ) : null}

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
                    {(() => {
                      const reqEngines = selectedRoute.requiredEngines || 0;
                      const matchCards = self.cards[selectedRoute.color as CardColor] || 0;
                      const locomotives = self.cards['LOCOMOTIVE'] || 0;
                      if (locomotives < reqEngines) return '❌ Insufficient Wildcards';
                      const remainingLocomotives = locomotives - reqEngines;
                      return matchCards + remainingLocomotives >= selectedRoute.length - reqEngines ? '✅ Available' : '❌ Insufficient';
                    })()}
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
                  !claimingColor || (() => {
                    const reqEngines = selectedRoute.requiredEngines || 0;
                    const matchCards = self.cards[claimingColor] || 0;
                    const locomotives = self.cards['LOCOMOTIVE'] || 0;
                    if (locomotives < reqEngines) return true;
                    const remainingLocomotives = locomotives - reqEngines;
                    return matchCards + remainingLocomotives < selectedRoute.length - reqEngines;
                  })()
                }
              >
                <Sparkles size={16} /> Claim Route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tunnel Claim Overlay */}
      {gameState.pendingTunnelClaim && (() => {
        const claim = gameState.pendingTunnelClaim;
        const claimant = gameState.players.find(p => p.id === claim.playerId);
        const route = gameState.routes.find(r => r.id === claim.routeId);
        if (!claimant || !route) return null;

        const isClaimant = claim.playerId === playerId;

        return (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 8, 16, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                color: '#fff',
                textAlign: 'center'
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#60a5fa' }}>
                Tunnel Claim: {route.city1} ⟷ {route.city2}
              </h3>
              
              {isClaimant ? (
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                    You drew 3 cards from the deck to test the tunnel.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
                    {claim.drawnCards.map((card, idx) => {
                      const matchesClaimColor = (card === claim.cardColorToUse || card === 'LOCOMOTIVE');
                      return (
                        <div
                          key={idx}
                          style={{
                            width: '60px',
                            height: '90px',
                            borderRadius: '8px',
                            border: matchesClaimColor ? '2.5px solid #ef4444' : `2px solid ${getHexColor(card)}`,
                            background: matchesClaimColor ? 'rgba(239, 68, 68, 0.15)' : `${getHexColor(card)}20`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            filter: matchesClaimColor ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' : `drop-shadow(0 0 5px ${getHexColor(card)}40)`,
                            position: 'relative',
                            animation: 'cardReveal 0.3s ease-out forwards',
                            animationDelay: `${idx * 150}ms`,
                            opacity: 0,
                            transform: 'scale(0.8) translateY(10px)'
                          }}
                        >
                          {matchesClaimColor && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 0 5px rgba(239, 68, 68, 0.8)'
                              }}
                            >
                              +1
                            </div>
                          )}
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: matchesClaimColor ? '#ef4444' : getHexColor(card) }}>
                            {card === 'LOCOMOTIVE' ? 'WILD' : card}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '24px', color: claim.extraCost > 0 ? '#fbbf24' : '#10b981' }}>
                    {claim.extraCost > 0 ? (
                      `⚠️ Extra cost: +${claim.extraCost} matching card${claim.extraCost > 1 ? 's' : ''} (or locomotives) required!`
                    ) : (
                      '✅ Safe! No extra cost required.'
                    )}
                  </p>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={cancelTunnelClaim}>
                      Cancel Claim
                    </button>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
                      onClick={confirmTunnelClaim}
                      disabled={!claim.canAfford}
                    >
                      Confirm Claim
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                    Waiting for <strong>{claimant.name}</strong> to resolve their tunnel claim...
                  </p>
                  <div className="spinner" style={{ margin: '0 auto 10px auto' }}></div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Train Station Placement Modal */}
      {(selectedCityForStation || isBuildingStation) && self && (() => {
        const stationsLeft = self.stationsLeft ?? 3;
        const cost = 4 - stationsLeft;
        const options = getStationPaymentOptions();
        const eligibleCities = gameState.mapType === 'EUROPE'
          ? EUROPE_CITIES.map(c => c.name).filter(name => !gameState.stations?.[name]).sort()
          : [];

        const handleCancel = () => {
          setSelectedCityForStation(null);
          setStationPaymentColor('');
          onCloseStationBuild?.();
        };

        return (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 8, 16, 0.7)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
              padding: '20px'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                color: '#fff'
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: '#fbbf24', textAlign: 'center' }}>
                Place Train Station
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Select City:
                </label>
                <div
                  style={{
                    maxHeight: '140px',
                    overflowY: 'auto',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  {eligibleCities.map(cityName => {
                    const isSelected = selectedCityForStation === cityName;
                    return (
                      <button
                        key={cityName}
                        onClick={() => {
                          setSelectedCityForStation(cityName);
                          setStationPaymentColor('');
                        }}
                        className={`city-list-item ${isSelected ? 'selected' : ''}`}
                      >
                        <span>{cityName}</span>
                        {isSelected && (
                          <span style={{ fontSize: '10px', background: '#fbbf24', color: '#0f172a', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedCityForStation ? (
                <>
                  <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
                    Build a station in <strong>{selectedCityForStation}</strong> to use an opponent's route connecting to it.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      marginBottom: '20px',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}
                  >
                    <span>Cost (Station #{4 - stationsLeft}):</span>
                    <strong style={{ color: '#fbbf24' }}>{cost} Card{cost > 1 ? 's' : ''}</strong>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Select Payment Card Color:
                    </label>
                    {options.length === 0 ? (
                      <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>
                        ❌ You do not have enough cards of any color (with locomotives) to cover the cost.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        {options.map(color => (
                          <button
                            key={color}
                            className={`btn-secondary ${stationPaymentColor === color ? 'text-glow' : ''}`}
                            onClick={() => setStationPaymentColor(color)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              border: stationPaymentColor === color ? `2px solid ${getHexColor(color)}` : '1px solid rgba(255,255,255,0.05)',
                              background: stationPaymentColor === color ? 'rgba(255, 255, 255, 0.05)' : undefined
                            }}
                          >
                            <span
                              style={{
                                width: '10px',
                                height: '14px',
                                borderRadius: '2px',
                                background: getHexColor(color),
                                display: 'inline-block'
                              }}
                            />
                            {color} ({self.cards[color] || 0})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginBottom: '24px', fontStyle: 'italic' }}>
                  Please select a city to view placement options and costs.
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 1 }}
                  onClick={executePlaceStation}
                  disabled={!selectedCityForStation || !stationPaymentColor}
                >
                  Place Station
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
