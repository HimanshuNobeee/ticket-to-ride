export type CardColor =
  | 'RED'
  | 'BLUE'
  | 'GREEN'
  | 'YELLOW'
  | 'BLACK'
  | 'ORANGE'
  | 'WHITE'
  | 'PURPLE'
  | 'LOCOMOTIVE';

export type RouteColor = CardColor | 'GREY';

export interface City {
  name: string;
  x: number; // 0 to 1000
  y: number; // 0 to 600
}

export interface Route {
  id: string;
  city1: string;
  city2: string;
  length: number;
  color: RouteColor;
  claimedBy: string | null; // Player ID or null
  isTunnel?: boolean;
  requiredEngines?: number;
}

export interface DestinationTicket {
  id: string;
  city1: string;
  city2: string;
  points: number;
  pointsAwarded?: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string; // Hex code or label for UI
  cards: Record<CardColor, number>;
  destinationTickets: DestinationTicket[];
  claimedRoutes: string[]; // Route IDs
  trainsLeft: number;
  points: number;
  isReady: boolean;
  isConnected: boolean;
  isKicked?: boolean;
  stationsLeft?: number;
}

export interface PendingTunnelClaim {
  playerId: string;
  routeId: string;
  cardColorToUse: CardColor;
  colorCardsUsed: number;
  locomotivesUsed: number;
  drawnCards: CardColor[];
  extraCost: number;
  canAfford: boolean;
}

export interface GameState {
  roomId: string;
  players: Player[];
  deck: CardColor[];
  faceUpCards: CardColor[];
  destinationDeck: DestinationTicket[];
  turnIndex: number;
  gameStage: 'LOBBY' | 'INITIAL_DRAW' | 'PLAYING' | 'LAST_ROUND' | 'GAME_OVER';
  lastPlayerId: string | null; // ID of player who triggered last round
  winnerId: string | null;
  longestRoutePlayerId: string | null;
  history: string[]; // Activity log
  routes: Route[];
  mapType: 'CLASSIC_USA' | 'EUROPE' | 'INDIA';
  lastRoundTurnsLeft?: number;
  pendingTunnelClaim?: PendingTunnelClaim | null;
  stations?: Record<string, string>; // mapping from cityName -> playerId
}

export const CITIES: City[] = [
  { name: 'Seattle', x: 100, y: 80 },
  { name: 'Portland', x: 90, y: 140 },
  { name: 'San Francisco', x: 60, y: 280 },
  { name: 'Los Angeles', x: 110, y: 400 },
  { name: 'Helena', x: 280, y: 140 },
  { name: 'Salt Lake City', x: 240, y: 260 },
  { name: 'Denver', x: 370, y: 310 },
  { name: 'El Paso', x: 380, y: 480 },
  { name: 'Winnipeg', x: 480, y: 70 },
  { name: 'Kansas City', x: 560, y: 310 },
  { name: 'Houston', x: 560, y: 500 },
  { name: 'New Orleans', x: 670, y: 500 },
  { name: 'Chicago', x: 700, y: 220 },
  { name: 'Nashville', x: 740, y: 330 },
  { name: 'Atlanta', x: 780, y: 390 },
  { name: 'Miami', x: 890, y: 540 },
  { name: 'Montreal', x: 910, y: 80 },
  { name: 'Boston', x: 960, y: 120 },
  { name: 'New York', x: 930, y: 180 },
  { name: 'Washington DC', x: 880, y: 250 }
];

export const INITIAL_ROUTES: Route[] = [
  { id: 'sea_por', city1: 'Seattle', city2: 'Portland', length: 1, color: 'GREY', claimedBy: null },
  { id: 'sea_hel', city1: 'Seattle', city2: 'Helena', length: 6, color: 'YELLOW', claimedBy: null },
  { id: 'por_slc', city1: 'Portland', city2: 'Salt Lake City', length: 6, color: 'BLUE', claimedBy: null },
  { id: 'por_sfo', city1: 'Portland', city2: 'San Francisco', length: 5, color: 'GREEN', claimedBy: null },
  { id: 'sfo_slc', city1: 'San Francisco', city2: 'Salt Lake City', length: 5, color: 'ORANGE', claimedBy: null },
  { id: 'sfo_lax', city1: 'San Francisco', city2: 'Los Angeles', length: 3, color: 'PURPLE', claimedBy: null },
  { id: 'lax_slc', city1: 'Los Angeles', city2: 'Salt Lake City', length: 3, color: 'ORANGE', claimedBy: null },
  { id: 'lax_elp', city1: 'Los Angeles', city2: 'El Paso', length: 6, color: 'BLACK', claimedBy: null },
  { id: 'hel_wpg', city1: 'Helena', city2: 'Winnipeg', length: 4, color: 'BLUE', claimedBy: null },
  { id: 'hel_den', city1: 'Helena', city2: 'Denver', length: 4, color: 'GREEN', claimedBy: null },
  { id: 'slc_den', city1: 'Salt Lake City', city2: 'Denver', length: 3, color: 'RED', claimedBy: null },
  { id: 'den_wpg', city1: 'Denver', city2: 'Winnipeg', length: 4, color: 'BLACK', claimedBy: null },
  { id: 'den_kcs', city1: 'Denver', city2: 'Kansas City', length: 4, color: 'ORANGE', claimedBy: null },
  { id: 'den_elp', city1: 'Denver', city2: 'El Paso', length: 4, color: 'RED', claimedBy: null },
  { id: 'elp_hou', city1: 'El Paso', city2: 'Houston', length: 6, color: 'GREEN', claimedBy: null },
  { id: 'wpg_chi', city1: 'Winnipeg', city2: 'Chicago', length: 4, color: 'BLUE', claimedBy: null },
  { id: 'kcs_chi', city1: 'Kansas City', city2: 'Chicago', length: 2, color: 'BLUE', claimedBy: null },
  { id: 'kcs_hou', city1: 'Kansas City', city2: 'Houston', length: 4, color: 'YELLOW', claimedBy: null },
  { id: 'kcs_nas', city1: 'Kansas City', city2: 'Nashville', length: 3, color: 'ORANGE', claimedBy: null },
  { id: 'hou_nol', city1: 'Houston', city2: 'New Orleans', length: 2, color: 'GREY', claimedBy: null },
  { id: 'nol_atl', city1: 'New Orleans', city2: 'Atlanta', length: 4, color: 'YELLOW', claimedBy: null },
  { id: 'nol_mia', city1: 'New Orleans', city2: 'Miami', length: 6, color: 'RED', claimedBy: null },
  { id: 'chi_mtr', city1: 'Chicago', city2: 'Montreal', length: 3, color: 'WHITE', claimedBy: null },
  { id: 'chi_nyc', city1: 'Chicago', city2: 'New York', length: 3, color: 'RED', claimedBy: null },
  { id: 'chi_nas', city1: 'Chicago', city2: 'Nashville', length: 3, color: 'GREY', claimedBy: null },
  { id: 'nas_atl1', city1: 'Nashville', city2: 'Atlanta', length: 1, color: 'GREY', claimedBy: null },
  { id: 'nas_atl2', city1: 'Nashville', city2: 'Atlanta', length: 1, color: 'GREY', claimedBy: null },
  { id: 'nas_was', city1: 'Nashville', city2: 'Washington DC', length: 3, color: 'BLACK', claimedBy: null },
  { id: 'atl_mia', city1: 'Atlanta', city2: 'Miami', length: 5, color: 'BLUE', claimedBy: null },
  { id: 'atl_was', city1: 'Atlanta', city2: 'Washington DC', length: 2, color: 'GREY', claimedBy: null },
  { id: 'nyc_bos', city1: 'New York', city2: 'Boston', length: 2, color: 'RED', claimedBy: null },
  { id: 'nyc_was', city1: 'New York', city2: 'Washington DC', length: 2, color: 'ORANGE', claimedBy: null },
  { id: 'mtr_bos', city1: 'Montreal', city2: 'Boston', length: 2, color: 'GREY', claimedBy: null },
  { id: 'mtr_nyc', city1: 'Montreal', city2: 'New York', length: 3, color: 'BLUE', claimedBy: null },
  { id: 'mia_was', city1: 'Miami', city2: 'Washington DC', length: 6, color: 'GREEN', claimedBy: null }
];

export const DESTINATION_TICKETS: DestinationTicket[] = [
  { id: 't1', city1: 'Seattle', city2: 'New York', points: 22 },
  { id: 't2', city1: 'Los Angeles', city2: 'New York', points: 21 },
  { id: 't3', city1: 'Los Angeles', city2: 'Miami', points: 20 },
  { id: 't4', city1: 'Portland', city2: 'Nashville', points: 17 },
  { id: 't5', city1: 'Montreal', city2: 'Atlanta', points: 9 },
  { id: 't6', city1: 'San Francisco', city2: 'Atlanta', points: 17 },
  { id: 't7', city1: 'Seattle', city2: 'Los Angeles', points: 9 },
  { id: 't8', city1: 'Denver', city2: 'Chicago', points: 7 },
  { id: 't9', city1: 'Winnipeg', city2: 'Houston', points: 12 },
  { id: 't10', city1: 'Chicago', city2: 'New Orleans', points: 7 },
  { id: 't11', city1: 'Helena', city2: 'Los Angeles', points: 8 },
  { id: 't12', city1: 'Montreal', city2: 'New Orleans', points: 13 },
  { id: 't13', city1: 'Boston', city2: 'Miami', points: 12 },
  { id: 't14', city1: 'Denver', city2: 'El Paso', points: 4 },
  { id: 't15', city1: 'Kansas City', city2: 'Houston', points: 5 },
  { id: 't16', city1: 'Winnipeg', city2: 'Chicago', points: 6 }
];

export const ROUTE_POINTS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 10,
  6: 15
};

export const CARD_COLORS: CardColor[] = [
  'RED',
  'BLUE',
  'GREEN',
  'YELLOW',
  'BLACK',
  'ORANGE',
  'WHITE',
  'PURPLE',
  'LOCOMOTIVE'
];
