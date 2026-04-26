import { useState, useCallback, useEffect, useRef } from 'react';
import { idiomLib } from '../idiomLib';
import { GameSession, GameMode, GameMessage, RecordType, ChallengeConfig, LimitedTimeConfig, Player } from '../types';
import useLocalStorageState from './useLocalStorageState';
import { generateAvatarColor } from '../utils/generateAvatarColor';

const SESSIONS_KEY = 'chengyujielong_sessions';

function getErrorMessage(type: RecordType): string {
    switch (type) {
        case RecordType.IdiomNotExist:
            return '成语不存在！';
        case RecordType.IdiomDuplicate:
            return '成语已经使用过了！';
        case RecordType.PinyinNotMatch:
            return '拼音不匹配！';
        default:
            return '未知错误';
    }
}

function calculateEndlessScore(timeCostMs: number): number {
    const timeCostSeconds = timeCostMs / 1000;
    if (timeCostSeconds <= 10) {
        return 10;
    } else if (timeCostSeconds <= 20) {
        return 9;
    } else if (timeCostSeconds <= 30) {
        return 8;
    } else if (timeCostSeconds <= 60) {
        return 7;
    } else {
        return 5;
    }
}

export interface GameState {
    currentSession: GameSession | null;
    sessions: GameSession[];
    remainingTime: number;
    currentTurnStartTime: number;
    gameRemainingTime: number;
}

export interface GameActions {
    startNewGame: (mode: GameMode, config?: ChallengeConfig | LimitedTimeConfig) => void;
    submitIdiom: (input: string) => { success: boolean; error?: string; errorType?: RecordType };
    giveUp: () => void;
    deleteSession: (sessionId: string) => void;
    clearAllSessions: () => void;
    importSessions: (sessions: GameSession[]) => void;
    triggerComputerTurn: (callback?: () => void) => void;
    addPlayer: (name: string) => void;
    removePlayer: (playerId: string) => void;
    updatePlayerName: (playerId: string, name: string) => void;
    getCurrentPlayer: () => Player | null;
    startMultiplayerGame: (players: Player[]) => void;
}

export function useGameState(): [GameState, GameActions] {
    const [sessions, setSessions] = useLocalStorageState<GameSession[]>(SESSIONS_KEY, []);
    const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const [currentTurnStartTime, setCurrentTurnStartTime] = useState(Date.now());
    const [gameRemainingTime, setGameRemainingTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    const gameTimerRef = useRef<number | null>(null);

    const saveCurrentSession = useCallback((session: GameSession) => {
        setSessions(prev => {
            const existingIndex = prev.findIndex(s => s.id === session.id);
            if (existingIndex >= 0) {
                const newSessions = [...prev];
                newSessions[existingIndex] = session;
                return newSessions;
            }
            return [...prev, session];
        });
    }, [setSessions]);

    const startTimer = useCallback((timeLimit: number) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setRemainingTime(timeLimit);
        timerRef.current = window.setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const resetTimer = useCallback((timeLimit: number) => {
        setRemainingTime(timeLimit);
    }, []);

    const startGameTimer = useCallback((gameTimeLimit: number) => {
        if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
        }
        setGameRemainingTime(gameTimeLimit);
        gameTimerRef.current = window.setInterval(() => {
            setGameRemainingTime(prev => {
                if (prev <= 1) {
                    if (gameTimerRef.current) {
                        clearInterval(gameTimerRef.current);
                        gameTimerRef.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const stopGameTimer = useCallback(() => {
        if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
            gameTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            stopTimer();
            stopGameTimer();
        };
    }, [stopTimer, stopGameTimer]);

    useEffect(() => {
        if (currentSession && remainingTime === 0 && currentSession.timeLimit && currentSession.timeLimit > 0 && currentSession.isActive) {
            const history = currentSession.messages
                .filter(m => !m.isError)
                .map(m => m.idiom);

            const robotIdiom = idiomLib.pickNext(history);
            if (robotIdiom) {
                const now = Date.now();
                const updatedSession = {
                    ...currentSession,
                    messages: [...currentSession.messages, {
                        idiom: robotIdiom,
                        isUser: false,
                        timestamp: now,
                        timeCost: 0
                    }]
                };
                idiomLib.markUsed(robotIdiom);
                setCurrentSession({
                    ...updatedSession,
                    isActive: false,
                    endTime: now
                });
                saveCurrentSession({
                    ...updatedSession,
                    isActive: false,
                    endTime: now
                });
            } else {
                setCurrentSession({
                    ...currentSession,
                    isActive: false,
                    endTime: Date.now()
                });
            }
        }
    }, [remainingTime, currentSession, saveCurrentSession]);

    useEffect(() => {
        if (currentSession && gameRemainingTime === 0 && currentSession.gameTimeLimit && currentSession.gameTimeLimit > 0 && currentSession.isActive) {
            const now = Date.now();
            const updatedSession = {
                ...currentSession,
                isActive: false,
                endTime: now
            };
            stopGameTimer();
            setCurrentSession(updatedSession);
            saveCurrentSession(updatedSession);
            console.info('[useGameState] Game ended - time limit reached');
        }
    }, [gameRemainingTime, currentSession, saveCurrentSession, stopGameTimer]);

    const startNewGame = useCallback((mode: GameMode, config?: ChallengeConfig | LimitedTimeConfig) => {
        idiomLib.reset();

        const firstIdiom = idiomLib.pickNext([]);
        if (!firstIdiom) {
            throw new Error('Failed to start game: no idioms available');
        }

        const now = Date.now();
        const session: GameSession = {
            id: `game_${now}`,
            mode,
            startTime: now,
            messages: [],
            score: 0,
            isActive: true
        };

        if (mode === GameMode.Challenge && config) {
            const challengeConfig = config as ChallengeConfig;
            session.challengeConfig = challengeConfig;
            if (challengeConfig.lives > 0) {
                session.lives = challengeConfig.lives;
                session.maxLives = challengeConfig.lives;
            }
            if (challengeConfig.timeLimit > 0) {
                session.timeLimit = challengeConfig.timeLimit;
            }
        }

        if (mode === GameMode.LimitedTime && config) {
            const limitedTimeConfig = config as LimitedTimeConfig;
            session.limitedTimeConfig = limitedTimeConfig;
            session.gameTimeLimit = limitedTimeConfig.gameTimeLimit;
        }

        session.messages.push({
            idiom: firstIdiom,
            isUser: false,
            timestamp: now,
            timeCost: 0
        });

        idiomLib.markUsed(firstIdiom);
        setCurrentSession(session);
        setCurrentTurnStartTime(now);
        saveCurrentSession(session);

        if (session.timeLimit && session.timeLimit > 0) {
            startTimer(session.timeLimit);
        } else {
            stopTimer();
        }

        if (session.gameTimeLimit && session.gameTimeLimit > 0) {
            startGameTimer(session.gameTimeLimit);
        } else {
            stopGameTimer();
        }

        console.info('[useGameState] Started new game:', mode, config);
    }, [saveCurrentSession, startTimer, stopTimer, startGameTimer, stopGameTimer]);

    const submitIdiom = useCallback((input: string): { success: boolean; error?: string; errorType?: RecordType } => {
        if (!currentSession || !currentSession.isActive) {
            return { success: false, error: '游戏未开始' };
        }

        const now = Date.now();
        const timeCost = now - currentTurnStartTime;

        const history = currentSession.messages
            .filter(m => !m.isError)
            .map(m => m.idiom);

        const result = idiomLib.appendIdiom(history, input);

        if (result !== RecordType.NoError) {
            const errorMessage = getErrorMessage(result);
            const message: GameMessage = {
                idiom: input,
                isUser: true,
                timestamp: now,
                timeCost,
                isError: true,
                errorType: result
            };

            if (currentSession.mode === GameMode.Multiplayer &&
                currentSession.players &&
                currentSession.currentPlayerIndex !== undefined) {
                message.playerId = currentSession.players[currentSession.currentPlayerIndex].id;
            }

            let updatedSession = {
                ...currentSession,
                messages: [...currentSession.messages, message]
            };

            if (currentSession.mode === GameMode.Challenge) {
                if (currentSession.lives !== undefined) {
                    updatedSession.lives = currentSession.lives - 1;

                    if (updatedSession.lives <= 0) {
                        updatedSession.isActive = false;
                        updatedSession.endTime = now;
                        stopTimer();
                        setCurrentSession(updatedSession);
                        saveCurrentSession(updatedSession);
                        return { success: false, error: `${errorMessage} 游戏结束！`, errorType: result };
                    } else {
                        setCurrentSession(updatedSession);
                        saveCurrentSession(updatedSession);
                        return { success: false, error: `${errorMessage} 剩余生命: ${updatedSession.lives}`, errorType: result };
                    }
                } else {
                    updatedSession.isActive = false;
                    updatedSession.endTime = now;
                    stopTimer();
                    setCurrentSession(updatedSession);
                    saveCurrentSession(updatedSession);
                    return { success: false, error: `${errorMessage} 游戏结束！`, errorType: result };
                }
            }

            setCurrentSession(updatedSession);
            saveCurrentSession(updatedSession);
            return { success: false, error: errorMessage, errorType: result };
        }

        const scoreToAdd = (currentSession.mode === GameMode.Endless ||
            currentSession.mode === GameMode.LimitedTime ||
            currentSession.mode === GameMode.Multiplayer)
            ? calculateEndlessScore(timeCost)
            : 10;

        const message: GameMessage = {
            idiom: input,
            isUser: true,
            timestamp: now,
            timeCost,
            score: scoreToAdd
        };

        let updatedSession = {
            ...currentSession,
            messages: [...currentSession.messages, message],
            score: currentSession.score + scoreToAdd
        };

        if (currentSession.mode === GameMode.Multiplayer &&
            currentSession.players &&
            currentSession.currentPlayerIndex !== undefined) {
            message.playerId = currentSession.players[currentSession.currentPlayerIndex].id;

            updatedSession.players = currentSession.players.map((p, index) =>
                index === currentSession.currentPlayerIndex
                    ? { ...p, score: p.score + scoreToAdd }
                    : p
            );

            updatedSession.currentPlayerIndex = (currentSession.currentPlayerIndex + 1) % currentSession.players.length;
        }

        idiomLib.markUsed(input);
        setCurrentTurnStartTime(now);

        if (updatedSession.timeLimit && updatedSession.timeLimit > 0) {
            resetTimer(updatedSession.timeLimit);
        }

        setCurrentSession(updatedSession);
        saveCurrentSession(updatedSession);

        return { success: true };
    }, [currentSession, currentTurnStartTime, saveCurrentSession, stopTimer, resetTimer]);

    const triggerComputerTurn = useCallback((callback?: () => void) => {
        setTimeout(() => {
            setCurrentSession(prevSession => {
                if (!prevSession || !prevSession.isActive) {
                    if (callback) callback();
                    return prevSession;
                }

                const history = prevSession.messages
                    .filter(m => !m.isError && !m.isGiveUp)
                    .map(m => m.idiom);

                const nextIdiom = idiomLib.pickNext(history);

                if (!nextIdiom) {
                    const updatedSession = {
                        ...prevSession,
                        isActive: false,
                        endTime: Date.now()
                    };
                    stopTimer();
                    saveCurrentSession(updatedSession);
                    if (callback) callback();
                    return updatedSession;
                }

                const now = Date.now();
                const message: GameMessage = {
                    idiom: nextIdiom,
                    isUser: false,
                    timestamp: now,
                    timeCost: now - currentTurnStartTime
                };

                const updatedSession = {
                    ...prevSession,
                    messages: [...prevSession.messages, message]
                };

                idiomLib.markUsed(nextIdiom);
                setCurrentTurnStartTime(now);

                if (updatedSession.timeLimit && updatedSession.timeLimit > 0) {
                    resetTimer(updatedSession.timeLimit);
                }

                saveCurrentSession(updatedSession);
                if (callback) callback();
                return updatedSession;
            });
        }, 500);
    }, [currentTurnStartTime, saveCurrentSession, stopTimer, resetTimer]);

    const giveUp = useCallback(() => {
        if (!currentSession || !currentSession.isActive) {
            return;
        }

        const now = Date.now();

        if (currentSession.mode === GameMode.Multiplayer &&
            currentSession.players &&
            currentSession.currentPlayerIndex !== undefined) {
            const giveUpMessage: GameMessage = {
                idiom: '放弃',
                isUser: true,
                timestamp: now,
                timeCost: 0,
                isGiveUp: true,
                score: 0,
                playerId: currentSession.players[currentSession.currentPlayerIndex].id
            };

            const updatedSession = {
                ...currentSession,
                messages: [...currentSession.messages, giveUpMessage],
                currentPlayerIndex: (currentSession.currentPlayerIndex + 1) % currentSession.players.length
            };

            setCurrentSession(updatedSession);
            saveCurrentSession(updatedSession);
            setCurrentTurnStartTime(now);
        } else if (currentSession.mode === GameMode.Endless || currentSession.mode === GameMode.LimitedTime) {
            const giveUpMessage: GameMessage = {
                idiom: '放弃',
                isUser: true,
                timestamp: now,
                timeCost: 0,
                isGiveUp: true,
                score: -10
            };

            const updatedSession = {
                ...currentSession,
                messages: [...currentSession.messages, giveUpMessage],
                score: currentSession.score - 10
            };
            setCurrentSession(updatedSession);
            saveCurrentSession(updatedSession);
            setCurrentTurnStartTime(now);
            triggerComputerTurn();
        }
    }, [currentSession, triggerComputerTurn, saveCurrentSession]);

    const deleteSession = useCallback((sessionId: string) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
    }, [setSessions]);

    const clearAllSessions = useCallback(() => {
        setSessions([]);
    }, [setSessions]);

    const importSessions = useCallback((importedSessions: GameSession[]) => {
        setSessions(importedSessions);
    }, [setSessions]);

    const addPlayer = useCallback((name: string) => {
        if (!currentSession || currentSession.mode !== GameMode.Multiplayer) {
            return;
        }

        const players = currentSession.players || [];
        const newPlayer: Player = {
            id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            avatarColor: generateAvatarColor(name),
            score: 0,
            turnOrder: players.length
        };

        const updatedSession = {
            ...currentSession,
            players: [...players, newPlayer]
        };

        setCurrentSession(updatedSession);
        saveCurrentSession(updatedSession);
    }, [currentSession, saveCurrentSession]);

    const removePlayer = useCallback((playerId: string) => {
        if (!currentSession || currentSession.mode !== GameMode.Multiplayer || !currentSession.players) {
            return;
        }

        const updatedPlayers = currentSession.players
            .filter(p => p.id !== playerId)
            .map((p, index) => ({ ...p, turnOrder: index }));

        const updatedSession = {
            ...currentSession,
            players: updatedPlayers,
            currentPlayerIndex: currentSession.currentPlayerIndex !== undefined &&
                currentSession.currentPlayerIndex >= updatedPlayers.length
                ? 0
                : currentSession.currentPlayerIndex
        };

        setCurrentSession(updatedSession);
        saveCurrentSession(updatedSession);
    }, [currentSession, saveCurrentSession]);

    const updatePlayerName = useCallback((playerId: string, name: string) => {
        if (!currentSession || currentSession.mode !== GameMode.Multiplayer || !currentSession.players) {
            return;
        }

        const updatedPlayers = currentSession.players.map(p =>
            p.id === playerId
                ? { ...p, name, avatarColor: generateAvatarColor(name) }
                : p
        );

        const updatedSession = {
            ...currentSession,
            players: updatedPlayers
        };

        setCurrentSession(updatedSession);
        saveCurrentSession(updatedSession);
    }, [currentSession, saveCurrentSession]);

    const getCurrentPlayer = useCallback((): Player | null => {
        if (!currentSession ||
            currentSession.mode !== GameMode.Multiplayer ||
            !currentSession.players ||
            currentSession.currentPlayerIndex === undefined) {
            return null;
        }

        return currentSession.players[currentSession.currentPlayerIndex] || null;
    }, [currentSession]);

    const startMultiplayerGame = useCallback((players: Player[]) => {
        if (players.length < 2) {
            throw new Error('At least 2 players required for multiplayer mode');
        }

        idiomLib.reset();

        const now = Date.now();
        const session: GameSession = {
            id: `game_${now}`,
            mode: GameMode.Multiplayer,
            startTime: now,
            messages: [],
            score: 0,
            isActive: true,
            players: players.map((p, index) => ({ ...p, turnOrder: index })),
            currentPlayerIndex: 0
        };

        setCurrentSession(session);
        setCurrentTurnStartTime(now);
        saveCurrentSession(session);

        console.info('[useGameState] Multiplayer game started with', players.length, 'players');
    }, [saveCurrentSession]);

    const state: GameState = {
        currentSession,
        sessions: [...sessions].sort((a, b) => b.startTime - a.startTime),
        remainingTime,
        currentTurnStartTime,
        gameRemainingTime
    };

    const actions: GameActions = {
        startNewGame,
        submitIdiom,
        giveUp,
        deleteSession,
        clearAllSessions,
        importSessions,
        triggerComputerTurn,
        addPlayer,
        removePlayer,
        updatePlayerName,
        getCurrentPlayer,
        startMultiplayerGame
    };

    return [state, actions];
}
