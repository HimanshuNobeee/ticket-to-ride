import pg from 'pg';
const { Pool } = pg;

const hasDb = !!process.env.DATABASE_URL;

let pool: any = null;

if (hasDb) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render/Supabase connection
    }
  });
} else {
  console.warn("⚠️ DATABASE_URL is not set in environment variables. Running in-memory fallback mode (game data will not persist on restart).");
}

export async function query(text: string, params?: any[]) {
  if (hasDb) {
    return pool.query(text, params);
  } else {
    return mockQuery(text, params);
  }
}

// Simple in-memory fallback mock database
const memoryDb: Record<string, string> = {};

async function mockQuery(text: string, params?: any[]): Promise<any> {
  const normalizedText = text.trim().replace(/\s+/g, ' ').toUpperCase();
  
  if (normalizedText.includes('CREATE TABLE')) {
    return { rows: [] };
  }
  
  if (normalizedText.includes('SELECT GAME_STATE FROM GAMES')) {
    const roomId = params ? params[0] : null;
    if (roomId && memoryDb[roomId]) {
      return { rows: [{ game_state: JSON.parse(memoryDb[roomId]) }] };
    }
    return { rows: [] };
  }
  
  if (normalizedText.includes('INSERT INTO GAMES')) {
    const roomId = params ? params[0] : null;
    const gameState = params ? params[1] : null;
    if (roomId && gameState) {
      memoryDb[roomId] = gameState;
    }
    return { rows: [] };
  }

  if (normalizedText.includes('DELETE FROM GAMES')) {
    const roomId = params ? params[0] : null;
    if (roomId) {
      delete memoryDb[roomId];
    }
    return { rows: [] };
  }
  
  return { rows: [] };
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS games (
      room_id VARCHAR(10) PRIMARY KEY,
      game_state JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  if (hasDb) {
    console.log("✅ PostgreSQL Database initialized successfully.");
  }
}
