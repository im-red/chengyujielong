export interface IdiomItem {
    word: string;
    pinyin: string;
    derivation: string;
    explanation: string;
    example: string;
    abbreviation: string;
}

export enum RecordType {
    NoError = 0,
    IdiomNotExist = 1,
    IdiomDuplicate = 2,
    PinyinNotMatch = 3
}

export enum GameMode {
    Endless = 'endless',
    Challenge = 'challenge',
    LimitedTime = 'limitedTime',
    Multiplayer = 'multiplayer'
}

export interface Player {
    id: string;
    name: string;
    avatarColor: string;
    score: number;
    turnOrder: number;
}

export interface ChallengeConfig {
    lives: number; // 0 means unlimited (classic mode)
    timeLimit: number; // 0 means no time limit (in seconds)
}

export interface LimitedTimeConfig {
    gameTimeLimit: number; // total game time limit in seconds
}

export interface GameMessage {
    idiom: string;
    isUser: boolean;
    timestamp: number;
    timeCost: number; // milliseconds
    isError?: boolean;
    errorType?: RecordType;
    score?: number; // score earned for this submission (only for Endless/LimitedTime mode)
    isGiveUp?: boolean; // true when user gives up
    playerId?: string; // for multiplayer mode - which player submitted this
}

export interface GameSession {
    id: string;
    mode: GameMode;
    startTime: number;
    endTime?: number;
    messages: GameMessage[];
    score: number;
    lives?: number; // for challenge mode
    maxLives?: number; // for challenge mode
    timeLimit?: number; // for challenge mode (per-turn time limit in seconds)
    gameTimeLimit?: number; // for limited-time mode (total game time limit in seconds)
    isActive: boolean;
    challengeConfig?: ChallengeConfig; // store original config
    limitedTimeConfig?: LimitedTimeConfig; // store original config
    players?: Player[]; // for multiplayer mode
    currentPlayerIndex?: number; // for multiplayer mode
}

export interface GameState {
    currentSession: GameSession | null;
    sessions: GameSession[];
    lastMessageTime: number;
}

export interface PinyinPatch {
    idiom: string;
    originalPinyin: string;
    correctedPinyin: string;
    createdAt: number;
}

export function isMultiplayerSession(session: GameSession): session is GameSession & { players: Player[], currentPlayerIndex: number } {
    return session.mode === GameMode.Multiplayer &&
        session.players !== undefined &&
        session.currentPlayerIndex !== undefined;
}

export function isSinglePlayerSession(session: GameSession): boolean {
    return session.mode !== GameMode.Multiplayer;
}
