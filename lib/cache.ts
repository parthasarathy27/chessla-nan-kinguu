// Cache utility — persists game state & preferences in localStorage

export const CACHE_KEYS = {
  GAME_STATE: "chess_game_state",
  MOVE_HISTORY: "chess_move_history",
  GAME_MODE: "chess_game_mode",
  AI_DIFFICULTY: "chess_ai_difficulty",
  BOARD_THEME: "chess_board_theme",
  USER_PREFERENCES: "chess_user_prefs",
  GAME_TIMER: "chess_game_timer",
  RECENT_GAMES: "chess_recent_games",
} as const;

export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];

// Generic read
export function cacheGet<T>(key: CacheKey, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Generic write
export function cacheSet<T>(key: CacheKey, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — ignore silently
  }
}

// Delete one key
export function cacheDel(key: CacheKey): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// Clear all chess-related cache (on logout)
export function cacheClear(): void {
  if (typeof window === "undefined") return;
  Object.values(CACHE_KEYS).forEach((k) => localStorage.removeItem(k));
}

// Game state types
export interface GameStateCache {
  fen: string;
  gameMode: "ai" | "human";
  aiDifficulty: "easy" | "medium" | "hard";
  moveHistory: string[];
  whiteTime: number;
  blackTime: number;
  isGameOver: boolean;
  winner: string | null;
  savedAt: number;
}

export interface RecentGame {
  id: string;
  date: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  moves: number;
  duration: string;
  opening: string;
}

export function saveGameState(state: Partial<GameStateCache>): void {
  const existing = cacheGet<GameStateCache>(CACHE_KEYS.GAME_STATE, {
    fen: "start",
    gameMode: "ai",
    aiDifficulty: "medium",
    moveHistory: [],
    whiteTime: 600,
    blackTime: 600,
    isGameOver: false,
    winner: null,
    savedAt: Date.now(),
  });
  cacheSet(CACHE_KEYS.GAME_STATE, { ...existing, ...state, savedAt: Date.now() });
}

export function loadGameState(): GameStateCache | null {
  const state = cacheGet<GameStateCache | null>(CACHE_KEYS.GAME_STATE, null);
  if (!state) return null;
  // Expire cached game after 2 hours
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  if (Date.now() - state.savedAt > TWO_HOURS) {
    cacheDel(CACHE_KEYS.GAME_STATE);
    return null;
  }
  return state;
}

export function addRecentGame(game: RecentGame): void {
  const games = cacheGet<RecentGame[]>(CACHE_KEYS.RECENT_GAMES, []);
  const updated = [game, ...games].slice(0, 10); // keep last 10
  cacheSet(CACHE_KEYS.RECENT_GAMES, updated);
}
