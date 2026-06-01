import { useState, useEffect } from 'react';
import { useGameSocket } from './hooks/useGameSocket.js';
import { Lobby } from './components/Lobby.js';
import { Board } from './components/Board.js';
import { Hand } from './components/Hand.js';
import { Deck } from './components/Deck.js';
import { Scoreboard } from './components/Scoreboard.js';
import { HistoryLog } from './components/HistoryLog.js';
import { AlertCircle, LogOut, Radio, Trophy, ArrowRight } from 'lucide-react';
import './App.css';

function App() {
  const [highlightedCities, setHighlightedCities] = useState<string[]>([]);
  const {
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
    setError
  } = useGameSocket();

  // Alert timer for autohiding messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const activePlayer = gameState?.players[gameState.turnIndex];
  const isMyTurn = activePlayer?.id === playerId;

  const isAutoRejoining = !gameState && !!localStorage.getItem('t2r_room_id');

  if (isAutoRejoining) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#090d16', color: '#fff' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', maxWidth: '400px' }}>
          <div className="animate-spin" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #3b82f6', borderTopColor: 'transparent', margin: '0 auto 20px auto', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>RECONNECTING SESSION</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
            We found an active game room session. Attempting to restore your connection...
          </p>
          <button 
            className="btn-secondary" 
            onClick={() => {
              localStorage.removeItem('t2r_room_id');
              window.location.reload();
            }}
            style={{ width: '100%', padding: '10px', fontSize: '13px' }}
          >
            Cancel & Go to Main Menu
          </button>
        </div>
      </div>
    );
  }

  // Render Lobby screen if no game is started or players are still in lobby stage
  if (!gameState || gameState.gameStage === 'LOBBY') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '40px' }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isConnected ? '#10b981' : '#ef4444' }}>
          <Radio size={14} className={isConnected ? 'pulse-glow' : ''} />
          <span>{isConnected ? 'Server Online' : 'Connecting to Server...'}</span>
        </div>

        <Lobby
          playerId={playerId}
          gameState={gameState}
          createRoom={createRoom}
          joinRoom={joinRoom}
          toggleReady={toggleReady}
          selectMap={selectMap}
          startGame={startGame}
          leaveRoom={leaveRoom}
          error={error}
          setError={setError}
        />
      </div>
    );
  }

  // Active game interface (PLAYING, LAST_ROUND, GAME_OVER)
  const isGameOver = gameState.gameStage === 'GAME_OVER';
  const isLastRound = gameState.gameStage === 'LAST_ROUND';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      
      {/* Top Banner Control Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          marginBottom: '20px',
          borderLeft: isLastRound ? '4px solid #ef4444' : undefined,
          background: isLastRound ? 'rgba(239, 68, 68, 0.08)' : 'rgba(15, 23, 42, 0.85)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            TICKET TO RIDE
          </h2>
          <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            Lobby: <strong>{gameState.roomId}</strong>
          </span>
        </div>

        {/* Turn alerts and Round Announcements */}
        <div style={{ textAlign: 'center' }}>
          {isGameOver ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: '700', fontSize: '15px' }}>
              <Trophy size={16} /> Game Concluded!
            </span>
          ) : isLastRound ? (
            <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '15px', animation: 'pulse-glow 1.5s infinite' }}>
              ⚠️ FINAL ROUND: {activePlayer?.name}'s turn (Last moves before scoring)
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activePlayer?.color, boxShadow: `0 0 6px ${activePlayer?.color}` }} />
              <span style={{ color: '#94a3b8' }}>Turn:</span>
              <strong style={{ color: '#fff' }}>{activePlayer?.name} {isMyTurn && '(You)'}</strong>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-secondary" onClick={leaveRoom} style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={14} /> Leave Room
          </button>
        </div>
      </div>

      {/* Pop-up error notifications */}
      {error && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '12px 24px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontWeight: '500', fontSize: '14px' }}>{error}</span>
        </div>
      )}

      {/* Main Board and Asset Dashboard Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 2.5fr) 1fr', gap: '20px', flex: 1 }}>
        
        {/* Left Hand Column: Board Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Board
            playerId={playerId}
            gameState={gameState}
            claimRoute={claimRoute}
            setError={setError}
            highlightedCities={highlightedCities}
          />
          {/* Historical text feed */}
          <HistoryLog history={gameState.history} />
        </div>

        {/* Right Hand Column: Inventory, Decks and Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Standings list */}
          <Scoreboard playerId={playerId} gameState={gameState} />

          {/* Cards to draw */}
          {!isGameOver && (
            <Deck
              playerId={playerId}
              gameState={gameState}
              drawTrainCard={drawTrainCard}
              drawDestinationTickets={drawDestinationTickets}
              chooseDestinationTickets={chooseDestinationTickets}
              selectInitialTickets={selectInitialTickets}
              setError={setError}
              onHighlightCities={setHighlightedCities}
            />
          )}

          {/* Player Hand asset stubs */}
          <Hand playerId={playerId} gameState={gameState} />
        </div>
      </div>

      {/* Victory recap full overlay */}
      {isGameOver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 12, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: '36px',
              width: '100%',
              maxWidth: '560px',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center'
            }}
          >
            <Trophy size={48} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 12px #fbbf24)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>
              RECKONING & VICTORY
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '24px' }}>
              Final score calculations completed.
            </p>

            {/* Standings List inside victory overlay */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px', textAlign: 'left' }}>
              {[...gameState.players].sort((a,b) => b.points - a.points).map((p, index) => {
                const isWinner = gameState.winnerId === p.id;
                const longestPath = gameState.longestRoutePlayerId === p.id;

                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: isWinner ? 'rgba(251, 191, 36, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      border: isWinner ? '1.5px solid #fbbf24' : '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: '800', color: '#64748b' }}>#{index + 1}</span>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.color }} />
                      <span style={{ fontWeight: '700', fontSize: '16px' }}>{p.name}</span>
                      {longestPath && (
                        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                          Longest Path (+10)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
                        {p.points}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="btn-primary"
              onClick={leaveRoom}
              style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
            >
              Return to Main Lobby <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
