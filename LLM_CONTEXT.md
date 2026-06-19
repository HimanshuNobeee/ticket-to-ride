# LLM Context - Multiplayer Ticket to Ride

This monorepo implements a real-time multiplayer version of the **Ticket to Ride** board game.

## Tech Stack & Architecture
- **Monorepo Manager**: `pnpm`
- **Frontend (`/client`)**: React, Vite, TypeScript, Socket.io-client, Lucide-react. Deployed on **Firebase Hosting** (`t2r-mp-673f2a.web.app`).
- **Backend (`/server`)**: Node.js, Express, Socket.io, Firebase Firestore (Database). Deployed on **Render** (`ticket-to-ride-jkyl.onrender.com`).

---

## Codebase Map

### 1. Frontend Client (`/client`)
- **`src/main.tsx` & `src/App.tsx`**: Entry point and top-level view router (Lobby vs. Game Board). Handles notification banners.
- **`src/index.css`**: Global design tokens, dark mode, glassmorphism, and micro-animations.
- **`src/hooks/useGameSocket.ts`**: Initialises Socket.io. Synchronises `gameState` from server to client. Exports action emitters (`createRoom`, `claimRoute`, etc.).
- **`src/utils/`**:
  - `gameData.ts`: Shared TS interfaces (`Player`, `GameState`, `Route`, `DestinationTicket`) and USA base data.
  - `usaMapData.ts` & `europeMapData.ts`: 1220x920 viewport coordinates for cities/routes on the USA and Europe maps.
- **`src/components/`**:
  - `Board.tsx`: Dynamic SVG vector board rendering (pan, zoom, cities, routes offset calculation, path claim overlays).
  - `Deck.tsx`: Train card deck, 5 face-up cards, and destination ticket piles with interactive draw actions.
  - `Hand.tsx`: Player hand showing train cards and active/completed destination tickets.
  - `Scoreboard.tsx`: Side panel displaying scores, remaining trains, connection status, and remaining turns.
  - `Lobby.tsx`: Room setup, player nickname/color choice, map selection (host settings), and Top 10 Hall of Fame.

### 2. Backend Server (`/server`)
- **`src/server.ts`**: Starts HTTPS server. Listens to socket requests (`claim-route`, `draw-card`, etc.). Runs a 30-min cron job to clean up abandoned rooms.
- **`src/gameManager.ts`**: The core game engine. Implements logic for turn control, route validations, deck recycling, card/ticket drawing, and final rounds.
- **`src/db.ts`**: Configures Firestore. Saves room states and queries the Leaderboard (Hall of Fame) sorted by `score` and `ticketsCompleted` in-memory.
- **`src/gameData.ts` / `usaMapData.ts` / `europeMapData.ts` / `indiaMapData.ts`**: Match the client-side data configurations for server-side state validation.

---

## Core Gameplay Logic & Rules

### 1. Lifecycle & Persistence
- Game states are cached in server memory and backed up to Firestore. Empty rooms are deleted after 24 hours of inactivity.
- On connection, players auto-reconnect using `t2r_player_id` stored in their local storage.

### 2. Map Settings & Setup
- **Maps**: `CLASSIC_USA` (38 cities, 45 trains) or `INDIA` (34 cities, 45 trains). (Europe Map is currently disabled).
- Players start with 4 train cards and 3 destination tickets (must keep at least 1).

### 3. Turn Actions
Each turn, a player must do one of:
- **Draw Train Cards**: Draw two cards (either face-up or from the deck). Drawing a face-up Locomotive/Wild counts as both card draws.
- **Draw Destination Tickets**: Draw 3 tickets, must keep at least 1.
- **Claim Route**: Spend matching color cards equal to route length. Double tracks can only be claimed by different players.

### 4. Last Round & Game End
- Triggered when any player has **2 or less train cars** left.
- **Turns Left**: The player who triggered the last round gets exactly **1 final turn**. All other players get **2 turns**.
- **Scoring**:
  - Route claiming points: 1 car = 1pt, 2 = 2pt, 3 = 4pt, 4 = 7pt, 5 = 10pt, 6 = 15pt.
  - Destination tickets: Evaluated in real-time. Completed tickets add points; incomplete tickets subtract points at the game's end.
