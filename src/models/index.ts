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

export interface LimitedTimeConfig {
    gameTimeLimit: number;
}

export interface GameMessage {
    idiom: string;
    isUser: boolean;
    timestamp: number;
    timeCost: number;
    isError?: boolean;
    errorType?: RecordType;
    score?: number;
    isGiveUp?: boolean;
    playerId?: string;
}

export interface GameSession {
    id: string;
    mode: GameMode;
    startTime: number;
    endTime?: number;
    messages: GameMessage[];
    score: number;
    gameTimeLimit?: number;
    isActive: boolean;
    limitedTimeConfig?: LimitedTimeConfig;
    players?: Player[];
    currentPlayerIndex?: number;
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
