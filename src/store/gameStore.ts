import { create } from 'zustand';
import type { GameState, GamePhase, GameAnswer, PlayerScore, RedCard, TimerState, MatchResult } from '@/types/game';

interface GameStore extends GameState {
  // Asosiy holat o'rnatish
  setPhase: (phase: GamePhase) => void;
  setRedCard: (card: RedCard | null) => void;
  setJudge: (judgeId: number | null) => void;
  setTimer: (timer: Partial<TimerState>) => void;
  setAdRound: (isAd: boolean) => void;

  // Javoblar
  addAnswer: (answer: GameAnswer) => void;
  revealAnswers: () => void;
  setWinner: (cardId: number, playerId: number) => void;
  clearAnswers: () => void;

  // Ballar
  updateScores: (scores: PlayerScore[]) => void;
  addScore: (playerId: number, points: number) => void;

  // Round boshqaruvi
  startRound: (redCard: RedCard, judgeId: number, isAd: boolean) => void;
  endRound: () => void;

  // Match boshqaruvi
  initMatch: (roomId: number, matchId: number, totalRounds: number) => void;
  endMatch: (result: MatchResult) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  roomId: 0,
  matchId: 0,
  currentRound: 0,
  totalRounds: 5,
  phase: 'waiting',
  currentRedCard: null,
  currentJudgeId: null,
  answers: [],
  scores: [],
  timer: {
    secondsLeft: 0,
    totalSeconds: 0,
    phase: 'waiting',
    isRunning: false,
  },
  isAdRound: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setRedCard: (card) => set({ currentRedCard: card }),

  setJudge: (judgeId) => set({ currentJudgeId: judgeId }),

  setTimer: (timer) =>
    set((state) => ({
      timer: { ...state.timer, ...timer },
    })),

  setAdRound: (isAd) => set({ isAdRound: isAd }),

  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
    })),

  revealAnswers: () =>
    set((state) => ({
      answers: state.answers.map((a) => ({ ...a, isRevealed: true })),
      phase: 'revealing' as GamePhase,
    })),

  setWinner: (cardId, playerId) =>
    set((state) => ({
      answers: state.answers.map((a) => ({
        ...a,
        isWinner: a.cardId === cardId && a.playerId === playerId,
      })),
    })),

  clearAnswers: () => set({ answers: [] }),

  updateScores: (scores) => set({ scores }),

  addScore: (playerId, points) =>
    set((state) => ({
      scores: state.scores.map((s) =>
        s.playerId === playerId
          ? { ...s, score: s.score + points, roundWins: s.roundWins + 1 }
          : s
      ),
    })),

  startRound: (redCard, judgeId, isAd) =>
    set((state) => ({
      currentRound: state.currentRound + 1,
      currentRedCard: redCard,
      currentJudgeId: judgeId,
      isAdRound: isAd,
      answers: [],
      phase: 'answering' as GamePhase,
      timer: {
        secondsLeft: 30,
        totalSeconds: 30,
        phase: 'answering',
        isRunning: true,
      },
    })),

  endRound: () =>
    set({
      phase: 'round_result' as GamePhase,
      timer: { secondsLeft: 0, totalSeconds: 0, phase: 'round_result', isRunning: false },
    }),

  initMatch: (roomId, matchId, totalRounds) =>
    set({
      ...initialState,
      roomId,
      matchId,
      totalRounds,
      phase: 'distributing' as GamePhase,
    }),

  endMatch: () =>
    set({
      phase: 'match_end' as GamePhase,
      timer: { secondsLeft: 0, totalSeconds: 0, phase: 'match_end', isRunning: false },
    }),

  resetGame: () => set(initialState),
}));
