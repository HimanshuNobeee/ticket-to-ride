# Multiplayer Ticket to Ride Game Walkthrough

We have successfully developed, refined, and launched a real-time, online multiplayer version of **Ticket to Ride**! 

The project is located at: `/Users/coolhim/Desktop/react projects/ticket-to-ride` and uses **pnpm** as the package manager and workspace tool.

---

## 🛠️ Recent Playability & Layout Updates

We recently updated the application layout, colors, and game logic to maximize usability, responsiveness, and gameplay pacing:

### 1. Mobile Responsiveness Layout
- **Game Container & Columns**: The inline flex/grid layout in App.tsx has been replaced by `.game-container`, `.map-column`, and `.sidebar-column` classes in index.css.
- **Responsive Stacking**: On screens wider than 900px, the board map and sidebar sit side-by-side. On screens smaller than 900px (mobile/tablet), they stack vertically.
- **Interactive Mobile Map**: The map is styled with a responsive height (`55vh`, `min-height: 420px`) on mobile devices, ensuring it remains fully zoomable and scrollable.
- **Top Banner & Ticket Drawer**: The header banner wraps cleanly to stack elements vertically on mobile. The Ticket selection drawer (`.ticket-drawer`) is fully responsive, restricting its maximum width to the screen boundaries (`calc(100vw - 40px)`) to prevent cropping on phones.

### 2. Premium Toy Train Car Visuals on Claimed Tracks
- **The Issue**: Claimed tracks simply filled with the claiming player's color, looking like solid flat blocks identical to unclaimed routes.
- **The Solution**: Redesigned the segment rendering inside Board.tsx. Claimed segments now display:
  - An inner dark window panel strip representing train passenger cabins (`rgba(0,0,0,0.55)`).
  - Two tiny wheels (`rgba(0,0,0,0.85)`) on the bottom side of the track.
  - End-to-end metal coupling brackets joining the segments together.
  *This transforms claimed routes into stylized "miniature toy train cars" that are instantly distinguishable from unclaimed routes.*

### 3. Clearer Black and Grey Track Contrast
- **The Issue**: Black tracks (`#4b5563`) and Grey tracks (`#64748b`) were very similar shades of slate grey, making them difficult to tell apart.
- **The Solution**: Unified track colors across Board.tsx, Hand.tsx, and Deck.tsx.
  - **Black Tracks/Cards**: Now return `#27272a` (zinc-800 charcoal) on the board map, which is clearly distinguishable as dark/black.
  - **Grey Tracks/Cards**: Now return `#94a3b8` (a light, bright silver-grey).
  - **Outline Outline**: Increased the stroke outline color of all unclaimed black routes to `rgba(255,255,255,0.25)` and other routes to `rgba(255,255,255,0.12)`, defining the routes clearly against the dark theme background.

### 4. Raleigh Station Clean-up (Route Removal)
- **The Issue**: The Raleigh city station circle was crossed and overlapped by a route connecting Richmond and Atlanta.
- **The Solution**: Removed the direct Richmond-to-Atlanta route (`rch_atl`) in client and server map files (usaMapData.ts and server/src/usaMapData.ts). This fits the official Ticket to Ride board layout (where connections go through Raleigh rather than bypassing it directly) and fixes the overlapping graphics.

### 5. Express USA Map Pacing (Train Count Tuning)
- **The Issue**: The Express map is compact and has only 117 total railroad track spaces. Having players start with 45 trains meant the board ran out of space long before players could trigger the end of the game, resulting in stuck lobbies.
- **The Solution**: In gameManager.ts, player starting train counts are configured dynamically when the game starts:
  - **Classic USA Map**: 45 starting trains.
  - **Express USA Map**: 30 starting trains.
  *This matches the fast-paced nature of shorter Ticket to Ride editions and ensures the game completes naturally.*

### 6. Fixed locked-mode track claiming
- **The Issue**: When map mode was locked to prevent pan/zoom, the pointer down listener ignored mouse coordinates entirely. This resulted in an incorrectly calculated drag distance relative to (0,0) on click, ignoring track claim inputs.
- **The Solution**: Refactored `handlePointerDown` inside Board.tsx to record click coordinates synchronously into the ref before returning early on locked modes.

### 7. Fixed final round "not your turn" blocker & initiator final turn
- **The Issues**: 
  1. When players triggered the final round, the game stage changed to `'LAST_ROUND'`. The client and server checked if `gameStage === 'PLAYING'` for all actions, causing subsequent draws and claims to report "it's not your turn" and block players.
  2. The game concluded prematurely when the turn cycled back to the initiator. For instance, in a 3-player game, if Player 0 triggered the last round, the game would end immediately after Player 2's turn, denying Player 0 their final turn.
- **The Solutions**: 
  - Updated client components (Board.tsx, Deck.tsx) and server game action validators in gameManager.ts to treat both `'PLAYING'` and `'LAST_ROUND'` as active, playable stages.
  - Implemented a countdown variable `lastRoundTurnsLeft` in `endTurn` in gameManager.ts. When `LAST_ROUND` is first triggered, `lastRoundTurnsLeft` is set to the number of players. It decrements by 1 at the end of each subsequent turn, ensuring every player (including the initiator) gets exactly one more turn before triggering the `GAME_OVER` stage.

### 8. Shuffled Discard Pile Recycling (Train Cards piling back up)
- **The Issue**: When players claimed tracks, their paid train cards were decremented from their hand but never returned to any discard pile. Over time, the deck ran dry, locking players out of drawing cards.
- **The Solution**: Added a server-side `discardPile` list to the game state. When players claim a route, paid cards are pushed into this pile. When the face-down train deck or face-up replenishment runs empty, the server automatically shuffles the `discardPile` back into the main deck.
- **Instant Deck Reshuffling**: Shuffling the discard pile back into the deck occurs instantly (`checkAndRecycleDeck`) as soon as the deck hits 0 during card draws or replenishments. The server also triggers recycling immediately after the replenishment loop terminates, ensuring that if the last card in the deck was drawn to make the 5th face-up card, the deck is immediately recycled without showing "0 left" or requiring a user click to trigger it.
- **Route Claim Replenishment**: When a player claims a route and adds cards to the discard pile, the server immediately triggers deck recycling and replenishes the face-up cards to 5 if they were previously short due to an empty deck.

### 9. Victory Observer Mode & Opponent Tickets
- **Victory Observer Toggle**: Added a "Observe Board" button inside the victory screen on App.tsx which hides the victory overlay. A floating "🏆 Show Standings" button appears in the bottom right, allowing players to reopen the standings popup whenever they want.
- **Opponent Tickets List**: At game over, the Scoreboard.tsx leaderboard lists each player's individual destination tickets (with green checkmarks for completed tickets and red crossmarks for failed tickets) showing exactly how their final points were computed.
- **Ticket Destination Highlighter**: Extended the opponent tickets list in `Scoreboard.tsx` to support hover event bindings. Players can hover over any of their opponents' completed or incomplete tickets in the scoreboard to see the endpoint cities and connection line highlight dynamically on the map, making it easy to observe their layouts!
- **Black Route Contrast**: Changed the black route fill color to `#3f3f46` (a visible charcoal gray) and increased outline stroke visibility (`rgba(255,255,255,0.5)` with `strokeWidth={0.95}`) to ensure black routes are clearly visible on the dark theme map.

### 10. Gameplay Feedback Animations & Micro-interactions
- **Claimed Route Snap Animations**: Inside Board.tsx, newly claimed routes trigger a sequential snapping animation. Toy train segments scale up and pop into position one-by-one from the first city to the second city using staggered delays (`120ms` intervals). This provides immediate visual feedback when routes are built.
- **Card Inventory Bounce & Color Glows**: In Hand.tsx, card slot items detect card additions and play a bounce-scale animation (`cardCountBump`) with a glowing drop-shadow. The glow color dynamically matches the color of the card drawn (e.g., drawing a yellow card creates a bright yellow glow).
- **Floating Action Toast Notification**: In App.tsx, a glassmorphic toast notification slides up at the bottom of the screen when players perform actions (drawing cards, choosing tickets, or claiming routes). It displays the action text along with a matching icon (Sparkles for route claims, Layers for card draws, Compass for ticket drafts), staying on screen for 4 seconds before sliding away.

### 11. Official Sibling/Parallel Double Route Constraints
- **The Rules**:
  1. A single player is forbidden from claiming both routes of a double route (parallel tracks between the same two cities).
  2. In 2 or 3 player games, only one of the double routes can be claimed. Once claimed, the other parallel route is permanently closed to all other players.
- **The Solution**: 
  - Refactored `claimRouteAction` in gameManager.ts to filter for matching sibling routes connecting the same endpoints. If a sibling route is claimed, it blocks the claim if it's the same player or if `players.length <= 3`.
  - Added matching local validation inside `handleRouteClick` in Board.tsx to check these rules and display informative, user-friendly errors (e.g. *"You cannot claim both routes of a double route"* or *"In 2 or 3 player games, only one of the double routes can be claimed"*).

### 12. Locomotive Infinite Loop & Dry Deck Stall Fixes
- **Locomotive Infinite Loop Prevention**:
  - **The Issue**: If the deck and discard pile combined are saturated with locomotives and lack colored cards, replenishing the face-up display triggers the "3+ locomotives face-up" rule, discarding them, and immediately redealing recursively, resulting in a stack overflow and server crash.
  - **The Solution**: In `replenishFaceUpCards` inside gameManager.ts, added a check to count the total non-locomotive (colored) cards remaining in the active supply (deck, discard, and face-up). If this count is less than 3, it is mathematically impossible to have fewer than 3 locomotives in a 5-card layout. The server now bypasses the redeal rule in this case and logs a history event, preventing the infinite recursion.
- **Dry Deck Turn End Protection & Locomotive-Only Supply Checks**:
  - **The Issue**: When all train cards are drawn (deck, discard pile, and face-up slots are completely empty), a player who has only drawn one card cannot draw a second card and becomes locked in their turn forever. Similarly, if the only remaining cards in the supply are face-up locomotives and the player has already drawn one card, they are forbidden by the rules from drawing a face-up locomotive, getting them stuck.
  - **The Solution**: In `drawTrainCard` inside gameManager.ts, we now calculate the total `validCardsForSecondDraw` (excluding face-up locomotives since they are illegal to draw on a second turn). If the player draws their first card and there are no valid cards left for their second draw (`validCardsForSecondDraw === 0`), the server logs this event and automatically ends their turn, transitioning the turn to the next player.

---

## 🚀 Deployed Production Environments

Your game is now fully hosted and playable online!

- **Frontend Client (Firebase Hosting)**: [https://t2r-mp-673f2a.web.app](https://t2r-mp-673f2a.web.app) (also accessible at [https://t2r-mp-673f2a.firebaseapp.com](https://t2r-mp-673f2a.firebaseapp.com))
- **Backend API (Render Web Service)**: [https://ticket-to-ride-jkyl.onrender.com](https://ticket-to-ride-jkyl.onrender.com)
