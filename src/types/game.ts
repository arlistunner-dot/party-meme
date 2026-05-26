/**
 * O'yin jarayoni tiplari
 */

export type GamePhase =
  | 'waiting'
  | 'distributing'
  | 'answering'
  | 'revealing'
  | 'judging'
  | 'democratic'
  | 'round_result'
  | 'match_end';

export interface GameState {
  roomId: number;
  matchId: number;
  currentRound: number;
  totalRounds: number;
  phase: GamePhase;
  currentRedCard: RedCard | null;
  currentJudgeId: number | null;
  answers: GameAnswer[];
  scores: PlayerScore[];
  timer: TimerState;
  isAdRound: boolean;
}

export interface RedCard {
  cardId: number;
  text: string;
  isAd: boolean;
  adBrand?: string;
}

export interface PlayerScore {
  playerId: number;
  username: string;
  firstName: string;
  score: number;
  roundWins: number;
}

export interface TimerState {
  secondsLeft: number;
  totalSeconds: number;
  phase: GamePhase;
  isRunning: boolean;
}

/**
 * Natija (match tugaganda)
 */
export interface MatchResult {
  matchId: number;
  winnerId: number;
  winnerName: string;
  totalRounds: number;
  duration: number;          // soniyada
  scores: PlayerScore[];
  ratingChanges: RatingChange[];
  coinRewards: CoinReward[];
  isAdWinner: boolean;       // Reklama kartasi g'olib bo'lsa
}

export interface RatingChange {
  playerId: number;
  oldRating: number;
  newRating: number;
  change: number;            // + yoki -
}

export interface CoinReward {
  playerId: number;
  amount: number;
  reason: 'match_win' | 'match_play' | 'ad_bonus';
}

/**
 * Maxsus kartalar (Chaos, Fusion, Infection)
 */
export interface SpecialCardEvent {
  type: 'chaos' | 'fusion' | 'infection';
  description: string;
  affectedPlayers: number[];
  data?: Record<string, unknown>;
}
