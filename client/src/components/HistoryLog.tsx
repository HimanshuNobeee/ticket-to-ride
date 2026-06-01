import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface HistoryLogProps {
  history: string[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to bottom when new logs arrive
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.65)', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '280px' }}>
      <h3 style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <Terminal size={16} color="#60a5fa" /> Game Feed & History
      </h3>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.03)',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#e2e8f0',
          lineHeight: '1.4'
        }}
      >
        {history.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '4px' }}>
            No activity logged yet.
          </div>
        ) : (
          history.map((log, index) => {
            // Apply subtle custom color styles based on key log types
            let color = '#e2e8f0';
            if (log.includes('claimed route')) color = '#34d399'; // Green success claim
            else if (log.includes('Game started') || log.includes('All players selected')) color = '#60a5fa'; // Blue highlights
            else if (log.includes('LAST ROUND')) color = '#f87171'; // Red warnings
            else if (log.includes('winner') || log.includes('🏆')) color = '#fbbf24'; // Yellow rewards

            return (
              <div key={index} style={{ color, padding: '2px 4px', borderBottom: '1px solid rgba(255,255,255,0.015)' }}>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
