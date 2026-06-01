import React, { useState, useEffect } from 'react';
import type { GameState, CardColor, DestinationTicket } from '../utils/gameData.js';
import { Layers, Sparkles, AlertCircle, Compass } from 'lucide-react';

interface DeckProps {
  playerId: string;
  gameState: GameState;
  drawTrainCard: (index: number) => void;
  drawDestinationTickets: () => void;
  chooseDestinationTickets: (keptIds: string[]) => void;
  selectInitialTickets: (keptIds: string[]) => void;
  setError: (err: string | null) => void;
  onHighlightCities: (cities: string[]) => void;
}

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

export const Deck: React.FC<DeckProps> = ({
  playerId,
  gameState,
  drawTrainCard,
  drawDestinationTickets,
  chooseDestinationTickets,
  selectInitialTickets,
  setError,
  onHighlightCities
}) => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [hoveredTicket, setHoveredTicket] = useState<DestinationTicket | null>(null);

  const activePlayer = gameState.players[gameState.turnIndex];
  const isMyTurn = activePlayer?.id === playerId && (gameState.gameStage === 'PLAYING' || gameState.gameStage === 'LAST_ROUND');

  const pendingTickets = (gameState as any).pendingTickets?.[playerId] as DestinationTicket[] | undefined;
  const isInitialDraw = gameState.gameStage === 'INITIAL_DRAW';

  // Pre-select all tickets when modal opens
  useEffect(() => {
    if (pendingTickets) {
      setSelectedTickets(pendingTickets.map(t => t.id));
    }
  }, [pendingTickets]);

  // Sync highlighted cities when selection or hover state updates
  useEffect(() => {
    if (!pendingTickets) {
      onHighlightCities([]);
      return;
    }

    if (hoveredTicket) {
      // Highlight only the hovered ticket endpoints and draw connecting line
      onHighlightCities([hoveredTicket.city1, hoveredTicket.city2]);
    } else {
      // Highlight all cities from currently checked tickets
      const cities: string[] = [];
      pendingTickets.forEach(t => {
        if (selectedTickets.includes(t.id)) {
          cities.push(t.city1, t.city2);
        }
      });
      onHighlightCities(cities);
    }

    // Clean up highlights when component unmounts
    return () => {
      onHighlightCities([]);
    };
  }, [selectedTickets, hoveredTicket, pendingTickets, onHighlightCities]);

  const handleCardClick = (index: number) => {
    if (!isMyTurn) {
      setError("It's not your turn!");
      return;
    }

    const card = index === -1 ? 'DECK' : gameState.faceUpCards[index];
    const drawCount = (gameState as any).drawCountThisTurn || 0;
    if (card === 'LOCOMOTIVE' && drawCount > 0) {
      setError("You cannot draw a face-up Locomotive as your second card.");
      return;
    }

    drawTrainCard(index);
  };

  const handleTicketDrawClick = () => {
    if (!isMyTurn) {
      setError("It's not your turn!");
      return;
    }
    const drawCount = (gameState as any).drawCountThisTurn || 0;
    if (drawCount > 0) {
      setError("You cannot draw destination tickets after drawing train cards.");
      return;
    }
    drawDestinationTickets();
  };

  const handleTicketToggle = (ticketId: string) => {
    if (selectedTickets.includes(ticketId)) {
      setSelectedTickets(selectedTickets.filter(id => id !== ticketId));
    } else {
      setSelectedTickets([...selectedTickets, ticketId]);
    }
  };

  const handleConfirmTickets = () => {
    if (!pendingTickets) return;

    const minCount = isInitialDraw ? 2 : 1;
    if (selectedTickets.length < minCount) {
      setError(`You must keep at least ${minCount} ticket${minCount > 1 ? 's' : ''}.`);
      return;
    }

    if (isInitialDraw) {
      selectInitialTickets(selectedTickets);
    } else {
      chooseDestinationTickets(selectedTickets);
    }
    setSelectedTickets([]);
    setHoveredTicket(null);
  };

  const drawCount = (gameState as any).drawCountThisTurn || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', width: '100%' }}>
      {/* Cards and Decks Board Grid */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.65)' }}>
        <h3 style={{ fontSize: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <Layers size={18} color="#3b82f6" /> Drawing Office & Decks
          {isMyTurn && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
              Your Turn: {2 - drawCount} draws remaining
            </span>
          )}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Drawing Decks Row (Train & Destination stacks on top) */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Face-Down Train Deck */}
            <div
              onClick={() => handleCardClick(-1)}
              style={{
                width: '68px',
                height: '96px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: isMyTurn ? 'pointer' : 'default',
                boxShadow: isMyTurn ? '0 0 15px rgba(59, 130, 246, 0.15)' : 'none',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              className="hover-scale"
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '4px' }}>
                <Layers size={16} color="#3b82f6" />
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>Train Pile</span>
              <span style={{ fontSize: '13px', fontWeight: '800', marginTop: '2px', fontFamily: 'Outfit, sans-serif' }}>{gameState.deck.length} left</span>
            </div>

            {/* Destination Ticket Pile */}
            <div
              onClick={handleTicketDrawClick}
              style={{
                width: '90px',
                height: '96px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0b29 100%)',
                border: '2px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: isMyTurn && drawCount === 0 ? 'pointer' : 'default',
                opacity: isMyTurn && drawCount === 0 ? 1 : 0.6,
                boxShadow: isMyTurn && drawCount === 0 ? '0 0 15px rgba(168, 85, 247, 0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
              title={drawCount > 0 ? 'Cannot draw tickets if you already drew train cards' : 'Draw destination tickets'}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(168,85,247,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '4px' }}>
                <Compass size={16} color="#a855f7" />
              </div>
              <span style={{ fontSize: '10px', color: '#c084fc', fontWeight: '600' }}>Destinations</span>
              <span style={{ fontSize: '13px', fontWeight: '800', marginTop: '2px', fontFamily: 'Outfit, sans-serif' }}>{gameState.destinationDeck.length} left</span>
            </div>
          </div>

          {/* 5 Face-Up Cards Row below */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
             {gameState.faceUpCards.map((color, index) => {
              const hex = getHexColor(color);
              const isWhite = color === 'WHITE';
              const isYellow = color === 'YELLOW';
              const isLocomotive = color === 'LOCOMOTIVE';
              const cardDisabled = isMyTurn && isLocomotive && drawCount > 0;

              return (
                <div
                  key={index}
                  onClick={() => !cardDisabled && handleCardClick(index)}
                  style={{
                    width: '68px',
                    height: '96px',
                    borderRadius: '10px',
                    background: isLocomotive
                      ? 'linear-gradient(45deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7)'
                      : hex,
                    border: isWhite ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.05)',
                    cursor: isMyTurn && !cardDisabled ? 'pointer' : 'default',
                    opacity: cardDisabled ? 0.35 : 1,
                    boxShadow: isMyTurn && !cardDisabled ? `0 4px 14px ${hex}40` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '8px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  title={cardDisabled ? 'Locomotive cannot be drawn as a 2nd card' : `Draw ${color.toLowerCase()}`}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', pointerEvents: 'none' }} />
                  <span style={{ fontSize: '9px', fontWeight: '800', color: isWhite || isYellow ? '#0f172a' : '#fff', letterSpacing: '-0.3px' }}>
                    {isLocomotive ? 'LOCO' : color}
                  </span>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' }}>
                    <Sparkles size={8} color={isWhite || isYellow ? '#0f172a' : '#fff'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Ticket Selection Drawer - Replaced full screen overlay to keep map fully visible */}
      {pendingTickets && (
        <div className="ticket-drawer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass color="#a855f7" size={22} />
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Draft Tickets</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>
            Hover over a ticket to draw its route on the board. You must keep at least{' '}
            <strong style={{ color: '#fff' }}>{isInitialDraw ? 2 : 1}</strong> ticket(s).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {pendingTickets.map(ticket => {
              const isSelected = selectedTickets.includes(ticket.id);
              return (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketToggle(ticket.id)}
                  onMouseEnter={() => setHoveredTicket(ticket)}
                  onMouseLeave={() => setHoveredTicket(null)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1.5px solid #a855f7' : '1.5px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 10px rgba(168,85,247,0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                      {ticket.city1} to
                    </span>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                      {ticket.city2}
                    </span>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: isSelected ? '#a855f7' : '#94a3b8' }}>
                    +{ticket.points} pts
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px' }}>
            <AlertCircle size={13} />
            <span>
              Keeping: {selectedTickets.length} (Target: min {isInitialDraw ? 2 : 1})
            </span>
          </div>

          <button
            className="btn-primary"
            onClick={handleConfirmTickets}
            disabled={selectedTickets.length < (isInitialDraw ? 2 : 1)}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '14px' }}
          >
            Confirm & End Turn
          </button>
        </div>
      )}
    </div>
  );
};
