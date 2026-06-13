import {
  GameState,
  Player,
  Route,
  DestinationTicket,
  CardColor,
  ROUTE_POINTS,
  CARD_COLORS,
  DESTINATION_TICKETS,
  INITIAL_ROUTES
} from './gameData.js';
import {
  USA_ROUTES,
  USA_DESTINATION_TICKETS
} from './usaMapData.js';
import {
  EUROPE_ROUTES,
  EUROPE_DESTINATION_TICKETS
} from './europeMapData.js';
import { getGameFromDb, saveGameToDb, deleteGameFromDb, updateHighScoreInDb, cleanupExpiredGamesInDb } from './db.js';

// Define the full active game state structure
export type ActiveGame = GameState & { 
  routes: Route[]; 
  drawCountThisTurn: number; 
  pendingTickets: Record<string, DestinationTicket[]>; 
  discardPile: CardColor[];
  lastRoundTurnsLeft?: number;
};

// Global map of active game states key=roomId (used as a memory cache)
const games: Record<string, ActiveGame> = {};

// Helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function checkAndRecycleDeck(game: ActiveGame) {
  if (game.deck.length === 0 && game.discardPile && game.discardPile.length > 0) {
    game.deck = shuffle([...game.discardPile]);
    game.discardPile = [];
    game.history.push('Train deck empty. Shuffled discard pile back into deck.');
  }
}

// Generate standard train deck
function createTrainDeck(): CardColor[] {
  const deck: CardColor[] = [];
  // 12 of each colored card
  const colors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'ORANGE', 'WHITE', 'PURPLE'];
  for (const c of colors) {
    for (let i = 0; i < 12; i++) deck.push(c);
  }
  // 14 Locomotive/Wildcard cards
  for (let i = 0; i < 14; i++) deck.push('LOCOMOTIVE');
  return shuffle(deck);
}

function getColorName(hex: string): string {
  const norm = hex.trim().toLowerCase();
  switch (norm) {
    case '#3b82f6': return 'Blue Glow';
    case '#ef4444': return 'Red Flare';
    case '#10b981': return 'Emerald';
    case '#f59e0b': return 'Amber';
    case '#a855f7': return 'Amethyst';
    default: return hex;
  }
}

// Initialize player state
function createPlayer(id: string, name: string, color: string): Player {
  const cards: Record<CardColor, number> = {
    RED: 0,
    BLUE: 0,
    GREEN: 0,
    YELLOW: 0,
    BLACK: 0,
    ORANGE: 0,
    WHITE: 0,
    PURPLE: 0,
    LOCOMOTIVE: 0
  };

  return {
    id,
    name,
    color,
    cards,
    destinationTickets: [],
    claimedRoutes: [],
    trainsLeft: 45,
    points: 0,
    isReady: false,
    isConnected: true
  };
}

// Fetch game from memory or database
export async function getGame(roomId: string): Promise<ActiveGame | null> {
  const code = roomId.toUpperCase();
  if (games[code]) {
    return games[code];
  }

  try {
    const state = await getGameFromDb(code);
    if (state) {
      games[code] = state as ActiveGame;
      return games[code];
    }
  } catch (err) {
    console.error(`Error loading game ${code} from database:`, err);
  }
  return null;
}

// Save game to memory and database
export async function saveGame(roomId: string, game: ActiveGame) {
  const code = roomId.toUpperCase();
  games[code] = game;
  try {
    await saveGameToDb(code, game);
  } catch (err) {
    console.error(`Error saving game ${code} to database:`, err);
  }
}

export async function createRoom(roomId: string): Promise<ActiveGame> {
  const code = roomId.toUpperCase();
  const game: ActiveGame = {
    roomId: code,
    players: [],
    deck: [],
    faceUpCards: [],
    destinationDeck: [],
    turnIndex: 0,
    gameStage: 'LOBBY' as const,
    lastPlayerId: null,
    winnerId: null,
    longestRoutePlayerId: null,
    history: ['Room created.'],
    routes: JSON.parse(JSON.stringify(INITIAL_ROUTES)),
    drawCountThisTurn: 0,
    pendingTickets: {},
    discardPile: [],
    mapType: 'EXPRESS_USA' as const
  };
  await saveGame(code, game);
  return game;
}

export async function deleteRoom(roomId: string) {
  const code = roomId.toUpperCase();
  delete games[code];
  try {
    await deleteGameFromDb(code);
  } catch (err) {
    console.error(`Error deleting game ${code} from database:`, err);
  }
}

export async function setMapType(roomId: string, mapType: 'CLASSIC_USA' | 'EXPRESS_USA' | 'EUROPE'): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game || game.gameStage !== 'LOBBY') return null;
  game.mapType = mapType;
  if (mapType === 'CLASSIC_USA') {
    game.routes = JSON.parse(JSON.stringify(USA_ROUTES));
  } else if (mapType === 'EUROPE') {
    game.routes = JSON.parse(JSON.stringify(EUROPE_ROUTES));
  } else {
    game.routes = JSON.parse(JSON.stringify(INITIAL_ROUTES));
  }
  const mapLabel = mapType === 'CLASSIC_USA' ? 'Classic USA Map' : mapType === 'EUROPE' ? 'Europe Map' : 'Express USA Map';
  game.history.push(`Map selected: ${mapLabel}.`);
  await saveGame(roomId, game);
  return game;
}

export async function joinRoom(roomId: string, playerId: string, playerName: string, playerColor: string): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game) return null;
  if (game.gameStage !== 'LOBBY' && !game.players.some(p => p.id === playerId)) {
    // Game already started and player is not reconnecting
    return null;
  }

  const existingPlayer = game.players.find(p => p.id === playerId);
  if (existingPlayer) {
    if (existingPlayer.isKicked) {
      console.log(`Kicked player ${existingPlayer.name} blocked from rejoining Room ${roomId}`);
      return null;
    }
    existingPlayer.isConnected = true;
    game.history.push(`${existingPlayer.name} reconnected.`);
    await saveGame(roomId, game);
    return game;
  }

  // Prevent color conflict by assigning the next available color
  let finalColor = playerColor;
  const takenColors = game.players.map(p => p.color);
  if (takenColors.includes(finalColor)) {
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a855f7'];
    const freeColor = defaultColors.find(c => !takenColors.includes(c));
    if (freeColor) {
      finalColor = freeColor;
    }
  }

  // Add new player to lobby
  const newPlayer = createPlayer(playerId, playerName, finalColor);
  game.players.push(newPlayer);
  game.history.push(`${playerName} joined the room with train color: ${getColorName(finalColor)}.`);
  await saveGame(roomId, game);
  return game;
}

export async function kickPlayer(roomId: string, hostPlayerId: string, playerToKickId: string): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game) return null;

  // The host is the first connected player in the list
  const host = game.players.find(p => p.isConnected);
  if (!host || host.id !== hostPlayerId) return null;
  if (playerToKickId === host.id) return game; // Host cannot kick themselves

  const player = game.players.find(p => p.id === playerToKickId);
  if (!player) return game;

  game.history.push(`Host ${host.name} kicked ${player.name} from the room.`);

  if (game.gameStage === 'LOBBY') {
    game.players = game.players.filter(p => p.id !== playerToKickId);
  } else {
    player.isConnected = false;
    player.isKicked = true; // prevent rejoining

    // If it was their turn, skip it
    const activePlayer = game.players[game.turnIndex];
    if (activePlayer && activePlayer.id === playerToKickId) {
      endTurn(game);
    }
  }

  await saveGame(roomId, game);
  return game;
}

export async function skipPlayerTurn(roomId: string, hostPlayerId: string, playerToSkipId: string): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game) return null;

  // Verify requester is the host
  const host = game.players.find(p => p.isConnected);
  if (!host || host.id !== hostPlayerId) return null;

  const activePlayer = game.players[game.turnIndex];
  if (!activePlayer || activePlayer.id !== playerToSkipId) return game; // Can only skip if it's their turn

  game.history.push(`Host ${host.name} skipped ${activePlayer.name}'s turn.`);
  endTurn(game);
  
  await saveGame(roomId, game);
  return game;
}

export async function leaveRoom(roomId: string, playerId: string): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player) return game;

  if (game.gameStage === 'LOBBY') {
    game.players = game.players.filter(p => p.id !== playerId);
    game.history.push(`${player.name} left the room.`);
  } else {
    player.isConnected = false;
    game.history.push(`${player.name} disconnected.`);
  }
  await saveGame(roomId, game);
  return game;
}

export async function setPlayerReady(roomId: string, playerId: string, isReady: boolean): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game) return null;
  const player = game.players.find(p => p.id === playerId);
  if (player) {
    player.isReady = isReady;
    game.history.push(`${player.name} is ${isReady ? 'ready' : 'not ready'}.`);
    await saveGame(roomId, game);
  }
  return game;
}

// Start the game!
export async function startGame(roomId: string): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game || game.players.length < 2) return null;

  game.gameStage = 'INITIAL_DRAW';
  game.deck = createTrainDeck();
  
  if (game.mapType === 'CLASSIC_USA') {
    game.routes = JSON.parse(JSON.stringify(USA_ROUTES));
    game.destinationDeck = shuffle([...USA_DESTINATION_TICKETS]);
  } else if (game.mapType === 'EUROPE') {
    game.routes = JSON.parse(JSON.stringify(EUROPE_ROUTES));
    game.destinationDeck = shuffle([...EUROPE_DESTINATION_TICKETS]);
  } else {
    game.routes = JSON.parse(JSON.stringify(INITIAL_ROUTES));
    game.destinationDeck = shuffle([...DESTINATION_TICKETS]);
  }

  game.turnIndex = 0;
  game.drawCountThisTurn = 0;
  game.lastPlayerId = null;
  delete (game as any).lastRoundTurnsLeft;

  const initialTrains = (game.mapType === 'CLASSIC_USA' || game.mapType === 'EUROPE') ? 45 : 30;

  // Deal 4 starting cards to each player
  for (const player of game.players) {
    player.trainsLeft = initialTrains;
    for (let i = 0; i < 4; i++) {
      const card = game.deck.pop();
      if (card) {
        player.cards[card]++;
      }
    }
    // Deal 3 starting destination tickets to choose from
    const tickets: DestinationTicket[] = [];
    for (let i = 0; i < 3; i++) {
      const ticket = game.destinationDeck.pop();
      if (ticket) tickets.push(ticket);
    }
    game.pendingTickets[player.id] = tickets;
  }

  // Draw 5 face-up cards
  replenishFaceUpCards(game);

  game.history.push('Game started! Players selecting initial destination tickets.');
  await saveGame(roomId, game);
  return game;
}

// Discard/redraw face-up cards if 3+ are Locomotives
function replenishFaceUpCards(game: ActiveGame) {
  while (game.faceUpCards.length < 5) {
    checkAndRecycleDeck(game);
    if (game.deck.length === 0) break; // No cards left anywhere

    const card = game.deck.pop();
    if (card) game.faceUpCards.push(card);
  }

  // Recycle deck if it went to zero during the replenishment loop
  checkAndRecycleDeck(game);

  // Count locomotives
  let locomotives = game.faceUpCards.filter((c: any) => c === 'LOCOMOTIVE').length;
  if (locomotives >= 3) {
    const totalNonLocomotives = [
      ...game.deck,
      ...(game.discardPile || []),
      ...game.faceUpCards
    ].filter(c => c !== 'LOCOMOTIVE').length;

    if (totalNonLocomotives >= 3) {
      game.history.push('3 or more locomotives face-up. Discarding and redealing face-up cards.');
      // Put back/discard and draw 5 new
      const oldFaceUp = game.faceUpCards;
      game.faceUpCards = [];
      if (!game.discardPile) game.discardPile = [];
      game.discardPile.push(...oldFaceUp);
      replenishFaceUpCards(game);
    } else {
      game.history.push('3 or more locomotives face-up, but not enough colored cards remain to redeal. Bypassing redeal.');
    }
  }
}

// Select destination tickets during initial draw
export async function selectInitialTickets(roomId: string, playerId: string, keptTicketIds: string[]): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game || game.gameStage !== 'INITIAL_DRAW') return null;

  const player = game.players.find(p => p.id === playerId);
  const pending = game.pendingTickets[playerId];
  if (!player || !pending) return null;

  // Must keep at least 2 tickets on initial draw
  if (keptTicketIds.length < 2) return null;

  const keptTickets = pending.filter(t => keptTicketIds.includes(t.id));
  const returnedTickets = pending.filter(t => !keptTicketIds.includes(t.id));

  // Add kept to player
  player.destinationTickets.push(...keptTickets);

  // Return others to bottom of destination deck
  game.destinationDeck = [...returnedTickets, ...game.destinationDeck];
  delete game.pendingTickets[playerId];

  creditCompletedTickets(game, player);

  game.history.push(`${player.name} selected ${keptTickets.length} destination tickets.`);

  // If all players have chosen their tickets, advance game stage to PLAYING
  const allChosen = game.players.every(p => !game.pendingTickets[p.id]);
  if (allChosen) {
    game.gameStage = 'PLAYING';
    game.history.push('All players selected tickets. The game begins!');
  }

  await saveGame(roomId, game);
  return game;
}

// Draw a train card (either from face-up or face-down deck)
export async function drawTrainCard(roomId: string, playerId: string, index: number): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game || (game.gameStage !== 'PLAYING' && game.gameStage !== 'LAST_ROUND')) return null;

  const activePlayer = game.players[game.turnIndex];
  if (activePlayer.id !== playerId) return null; // Not their turn
  if (game.drawCountThisTurn >= 2) return null; // Already drawn maximum

  const player = game.players.find(p => p.id === playerId)!;

  let drawnCard: CardColor | undefined;
  let isLocomotive = false;

  if (index === -1) {
    // Draw from face-down deck
    checkAndRecycleDeck(game);
    drawnCard = game.deck.pop();
    if (!drawnCard) return null; // Deck empty
    player.cards[drawnCard]++;
    game.history.push(`${player.name} drew a card from the deck.`);
    game.drawCountThisTurn++;
    checkAndRecycleDeck(game);
  } else {
    // Draw from face-up cards
    if (index < 0 || index >= game.faceUpCards.length) return null;
    drawnCard = game.faceUpCards[index];
    isLocomotive = drawnCard === 'LOCOMOTIVE';

    // A player can only draw a face-up Locomotive if they haven't drawn any cards yet this turn
    if (isLocomotive && game.drawCountThisTurn > 0) return null;

    player.cards[drawnCard]++;
    game.history.push(`${player.name} drew a face-up ${drawnCard}.`);

    // Remove from face-up and replenish
    game.faceUpCards.splice(index, 1);
    replenishFaceUpCards(game);

    if (isLocomotive) {
      game.drawCountThisTurn = 2; // Locomotive counts as both card draws
    } else {
      game.drawCountThisTurn++;
    }
  }

  // Check if turn is over
  const validCardsForSecondDraw = game.deck.length + (game.discardPile?.length || 0) + game.faceUpCards.filter((c: any) => c !== 'LOCOMOTIVE').length;
  if (game.drawCountThisTurn >= 2 || (game.drawCountThisTurn === 1 && validCardsForSecondDraw === 0)) {
    if (game.drawCountThisTurn < 2) {
      game.history.push('No more valid train cards available to draw. Ending turn early.');
    }
    endTurn(game);
  }

  await saveGame(roomId, game);
  return game;
}

// Draw destination tickets
export async function drawDestinationTicketsAction(roomId: string, playerId: string): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game || (game.gameStage !== 'PLAYING' && game.gameStage !== 'LAST_ROUND')) return null;

  const activePlayer = game.players[game.turnIndex];
  if (activePlayer.id !== playerId) return null;
  if (game.drawCountThisTurn > 0) return null; // Can't draw tickets if already drew cards

  // Draw top 3 tickets
  const tickets: DestinationTicket[] = [];
  for (let i = 0; i < 3; i++) {
    const t = game.destinationDeck.pop();
    if (t) tickets.push(t);
  }

  if (tickets.length === 0) return null; // No tickets left

  game.pendingTickets[playerId] = tickets;
  game.history.push(`${activePlayer.name} drew destination tickets to choose from.`);

  await saveGame(roomId, game);
  return game;
}

// Select tickets from the middle of the game
export async function chooseDestinationTickets(roomId: string, playerId: string, keptTicketIds: string[]): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  const pending = game.pendingTickets[playerId];
  if (!player || !pending) return null;

  // Mid-game draws require keeping at least 1 ticket
  if (keptTicketIds.length < 1) return null;

  const keptTickets = pending.filter(t => keptTicketIds.includes(t.id));
  const returnedTickets = pending.filter(t => !keptTicketIds.includes(t.id));

  player.destinationTickets.push(...keptTickets);

  // Return rejected cards to bottom of the deck
  game.destinationDeck = [...returnedTickets, ...game.destinationDeck];
  delete game.pendingTickets[playerId];

  creditCompletedTickets(game, player);

  game.history.push(`${player.name} selected ${keptTickets.length} new destination tickets.`);

  // Complete turn
  endTurn(game);

  await saveGame(roomId, game);
  return game;
}

// Claim a route
export async function claimRouteAction(
  roomId: string,
  playerId: string,
  routeId: string,
  cardColorToUse: CardColor
): Promise<ActiveGame | null> {
  const game = await getGame(roomId);
  if (!game || (game.gameStage !== 'PLAYING' && game.gameStage !== 'LAST_ROUND')) return null;

  const activePlayer = game.players[game.turnIndex];
  if (activePlayer.id !== playerId) return null;
  if (game.drawCountThisTurn > 0) return null; // Can't claim route if already drew cards

  const player = game.players.find(p => p.id === playerId)!;
  const route = game.routes.find(r => r.id === routeId);

  if (!route || route.claimedBy !== null) return null;

  // Sibling routes (parallel/double routes connecting the same two cities)
  const siblingRoutes = game.routes.filter(
    r => (r.city1 === route.city1 && r.city2 === route.city2) ||
         (r.city1 === route.city2 && r.city2 === route.city1)
  );

  if (siblingRoutes.length === 2) {
    const otherRoute = siblingRoutes.find(r => r.id !== route.id);
    if (otherRoute && otherRoute.claimedBy !== null) {
      // 1. A player cannot claim both routes of a double route (applies to all player counts)
      if (otherRoute.claimedBy === playerId) return null;
    }
  }

  if (player.trainsLeft < route.length) return null; // Not enough trains

  // Validate cards
  const cost = route.length;
  let matches = 0;
  let locomotives = player.cards['LOCOMOTIVE'];

  if (route.color === 'GREY') {
    // If route is grey, cardColorToUse specifies what color they want to pay with
    if (cardColorToUse === 'LOCOMOTIVE') {
      matches = 0; // Pure wildcards
    } else {
      matches = player.cards[cardColorToUse];
    }
  } else {
    // Must match route color
    cardColorToUse = route.color as CardColor;
    matches = player.cards[cardColorToUse];
  }

  if (matches + locomotives < cost) {
    return null; // Insufficient cards
  }

  // Deduct cards and add to discard pile
  let remainingCost = cost;
  const colorUsedCount = Math.min(matches, remainingCost);
  player.cards[cardColorToUse] -= colorUsedCount;
  if (!game.discardPile) game.discardPile = [];
  for (let i = 0; i < colorUsedCount; i++) {
    game.discardPile.push(cardColorToUse);
  }
  remainingCost -= colorUsedCount;

  if (remainingCost > 0) {
    player.cards['LOCOMOTIVE'] -= remainingCost;
    for (let i = 0; i < remainingCost; i++) {
      game.discardPile.push('LOCOMOTIVE');
    }
  }

  checkAndRecycleDeck(game);
  replenishFaceUpCards(game);

  // Update route and player state
  route.claimedBy = player.id;
  player.claimedRoutes.push(route.id);
  player.trainsLeft -= route.length;
  player.points += ROUTE_POINTS[route.length];
  creditCompletedTickets(game, player);

  game.history.push(
    `${player.name} claimed route ${route.city1} to ${route.city2} for ${ROUTE_POINTS[route.length]} points.`
  );

  // Check if this triggers the final round (trains left is 2 or fewer)
  if (player.trainsLeft <= 2 && game.lastPlayerId === null) {
    game.lastPlayerId = player.id;
    game.gameStage = 'LAST_ROUND';
    game.history.push(`LAST ROUND TRIGGERED! ${player.name} has ${player.trainsLeft} cars remaining.`);
  }

  // Complete turn
  endTurn(game);

  await saveGame(roomId, game);
  return game;
}

// Helper to transition turn
function endTurn(game: ActiveGame) {
  game.drawCountThisTurn = 0;

  if (game.gameStage === 'LAST_ROUND') {
    if (game.lastRoundTurnsLeft === undefined) {
      // Initiator just finished their turn.
      // Set countdown so that initiator gets 1 final turn, and everyone else gets 2 turns.
      game.lastRoundTurnsLeft = 2 * game.players.length - 1;
    } else {
      game.lastRoundTurnsLeft--;
      if (game.lastRoundTurnsLeft === 0) {
        // All players have taken their final turn. End the game.
        endGame(game);
        return;
      }
    }
  }

  game.turnIndex = (game.turnIndex + 1) % game.players.length;
}

// End game scoring and calculations
function endGame(game: ActiveGame) {
  game.gameStage = 'GAME_OVER';
  game.history.push('Game Over! Calculating final scores...');

  // 1. Calculate destination ticket scores for each player
  for (const player of game.players) {
    // Get routes claimed by this player
    const playerRoutes = game.routes.filter((r: Route) => r.claimedBy === player.id);

    let ticketScore = 0;
    game.history.push(`Scoring destinations for ${player.name}:`);

    for (const ticket of player.destinationTickets) {
      const connected = checkConnectivity(playerRoutes, ticket.city1, ticket.city2);
      if (connected) {
        if (!ticket.pointsAwarded) {
          ticket.pointsAwarded = true;
          player.points += ticket.points;
          ticketScore += ticket.points;
          game.history.push(`  ✅ Connected ${ticket.city1} - ${ticket.city2} (+${ticket.points} pts)`);
        } else {
          ticketScore += ticket.points;
          game.history.push(`  ✅ Connected ${ticket.city1} - ${ticket.city2} (already credited during game)`);
        }
      } else {
        player.points -= ticket.points;
        ticketScore -= ticket.points;
        game.history.push(`  ❌ Failed ${ticket.city1} - ${ticket.city2} (-${ticket.points} pts)`);
      }
    }
  }

  // 2. Calculate longest continuous route (+10 points)
  let longestPath = 0;
  let longestRoutePlayerIds: string[] = [];

  for (const player of game.players) {
    const playerRoutes = game.routes.filter((r: Route) => r.claimedBy === player.id);
    const length = getLongestPathForPlayer(playerRoutes);
    game.history.push(`${player.name}'s longest continuous path: ${length} train segments.`);
    
    if (length > longestPath) {
      longestPath = length;
      longestRoutePlayerIds = [player.id];
    } else if (length === longestPath && length > 0) {
      longestRoutePlayerIds.push(player.id);
    }
  }

  // Award +10 to longest path(s)
  if (longestPath > 0) {
    for (const id of longestRoutePlayerIds) {
      const p = game.players.find((player: Player) => player.id === id)!;
      p.points += 10;
      game.history.push(`🏆 Longest path bonus of +10 points awarded to ${p.name}!`);
    }
    // Set the first one as representative or log it
    game.longestRoutePlayerId = longestRoutePlayerIds[0];
  }

  // 3. Determine winner
  let maxPoints = -9999;
  let winnerId = null;

  for (const player of game.players) {
    if (player.points > maxPoints) {
      maxPoints = player.points;
      winnerId = player.id;
    }
  }

  game.winnerId = winnerId;
  const winner = game.players.find((p: Player) => p.id === winnerId);
  if (winner) {
    game.history.push(`🎉 Game finished! The winner is ${winner.name} with ${winner.points} points!`);
  }

  // 4. Record high scores for all players in this game
  for (const player of game.players) {
    const playerRoutes = game.routes.filter((r: Route) => r.claimedBy === player.id);
    let ticketsCompleted = 0;
    for (const ticket of player.destinationTickets) {
      const connected = checkConnectivity(playerRoutes, ticket.city1, ticket.city2);
      if (connected) {
        ticketsCompleted++;
      }
    }
    updateHighScoreInDb(player.name, player.points, ticketsCompleted).catch(err => {
      console.error(`Failed to record high score for ${player.name}:`, err);
    });
  }
}

// DFS to check city connectivity
function checkConnectivity(playerRoutes: Route[], city1: string, city2: string): boolean {
  const adj: Record<string, string[]> = {};
  for (const r of playerRoutes) {
    if (!adj[r.city1]) adj[r.city1] = [];
    if (!adj[r.city2]) adj[r.city2] = [];
    adj[r.city1].push(r.city2);
    adj[r.city2].push(r.city1);
  }

  const visited = new Set<string>();
  const queue = [city1];
  visited.add(city1);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === city2) return true;
    for (const neighbor of (adj[curr] || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

// DFS to find longest continuous path of trains (can reuse cities/nodes, but NOT routes/edges)
function getLongestPathForPlayer(playerRoutes: Route[]): number {
  let maxLen = 0;
  
  // build adjacency using route IDs as edges
  const adj: Record<string, { routeId: string, dest: string, length: number }[]> = {};
  for (const r of playerRoutes) {
    if (!adj[r.city1]) adj[r.city1] = [];
    if (!adj[r.city2]) adj[r.city2] = [];
    adj[r.city1].push({ routeId: r.id, dest: r.city2, length: r.length });
    adj[r.city2].push({ routeId: r.id, dest: r.city1, length: r.length });
  }

  function dfs(currCity: string, visitedEdges: Set<string>, currentLength: number) {
    if (currentLength > maxLen) {
      maxLen = currentLength;
    }
    const neighbors = adj[currCity] || [];
    for (const edge of neighbors) {
      if (!visitedEdges.has(edge.routeId)) {
        visitedEdges.add(edge.routeId);
        dfs(edge.dest, visitedEdges, currentLength + edge.length);
        visitedEdges.delete(edge.routeId);
      }
    }
  }

  // start search from every city in player's claimed routes
  for (const city of Object.keys(adj)) {
    dfs(city, new Set<string>(), 0);
  }

  return maxLen;
}

export function creditCompletedTickets(game: ActiveGame, player: Player) {
  const playerRoutes = game.routes.filter((r: Route) => r.claimedBy === player.id);
  for (const ticket of player.destinationTickets) {
    if (!ticket.pointsAwarded) {
      const connected = checkConnectivity(playerRoutes, ticket.city1, ticket.city2);
      if (connected) {
        ticket.pointsAwarded = true;
        player.points += ticket.points;
        game.history.push(
          `🎯 Destination Ticket Connected! ${player.name} connected ${ticket.city1} to ${ticket.city2} (+${ticket.points} pts).`
        );
      }
    }
  }
}

export async function cleanupExpiredGamesAction(): Promise<void> {
  const deletedRoomIds = await cleanupExpiredGamesInDb();
  for (const code of deletedRoomIds) {
    delete games[code];
    console.log(`🧹 Evicted empty room ${code} from memory cache.`);
  }
}
