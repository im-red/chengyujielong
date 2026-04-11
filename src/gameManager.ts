import { idiomLib } from './idiomLib';
import { GameSession, GameMode, GameMessage, RecordType, ChallengeConfig } from './types';
import { Storage } from './storage';

export class GameManager {
    private currentSession: GameSession | null = null;
    private sessions: GameSession[] = [];
    private lastMessageTime: number = 0;
    private timerInterval: number | null = null;
    private remainingTime: number = 0;
    private onGameEndCallback: (() => void) | null = null;

    constructor() {
        this.loadSessions();
    }

    setOnGameEndCallback(callback: () => void) {
        this.onGameEndCallback = callback;
    }

    private loadSessions() {
        this.sessions = Storage.loadSessions();
        console.info('[GameManager] Loaded sessions:', this.sessions.length);
    }

    private saveSessions() {
        Storage.saveSessions(this.sessions);
    }

    getSessions(): GameSession[] {
        return [...this.sessions].sort((a, b) => b.startTime - a.startTime);
    }

    getCurrentSession(): GameSession | null {
        return this.currentSession;
    }

    getRemainingTime(): number {
        return this.remainingTime;
    }

    startNewGame(mode: GameMode, config?: ChallengeConfig): GameSession {
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

        // Configure challenge mode
        if (mode === GameMode.Challenge && config) {
            session.challengeConfig = config;
            if (config.lives > 0) {
                session.lives = config.lives;
                session.maxLives = config.lives;
            }
            if (config.timeLimit > 0) {
                session.timeLimit = config.timeLimit;
            }
        }

        // Add first computer message
        session.messages.push({
            idiom: firstIdiom,
            isUser: false,
            timestamp: now,
            timeCost: 0
        });

        idiomLib.markUsed(firstIdiom);
        this.currentSession = session;
        this.lastMessageTime = now;
        this.sessions.push(session);
        this.saveSessions();

        if (session.timeLimit && session.timeLimit > 0) {
            this.startTimer();
        }

        console.info('[GameManager] Started new game:', mode, config);
        return session;
    }

    private startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        if (!this.currentSession || !this.currentSession.timeLimit) return;

        this.remainingTime = this.currentSession.timeLimit;

        this.timerInterval = window.setInterval(() => {
            this.remainingTime--;

            if (this.remainingTime <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    private stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private resetTimer() {
        if (this.currentSession && this.currentSession.timeLimit) {
            this.remainingTime = this.currentSession.timeLimit;
        }
    }

    private handleTimeout() {
        this.stopTimer();
        if (this.currentSession) {
            // Let robot submit an idiom before ending the game
            const history = this.currentSession.messages
                .filter(m => !m.isError)
                .map(m => m.idiom);

            const robotIdiom = idiomLib.pickNext(history);
            if (robotIdiom) {
                const now = Date.now();
                this.currentSession.messages.push({
                    idiom: robotIdiom,
                    isUser: false,
                    timestamp: now,
                    timeCost: 0
                });
                idiomLib.markUsed(robotIdiom);
                this.lastMessageTime = now;
            }

            this.endGame('超时！游戏结束。');
        }
    }

    submitIdiom(input: string): { success: boolean; error?: string; errorType?: RecordType } {
        if (!this.currentSession || !this.currentSession.isActive) {
            return { success: false, error: '游戏未开始' };
        }

        const now = Date.now();
        const timeCost = now - this.lastMessageTime;

        // Filter out error messages to get valid idiom history
        const history = this.currentSession.messages
            .filter(m => !m.isError)
            .map(m => m.idiom);

        const result = idiomLib.appendIdiom(history, input);

        if (result !== RecordType.NoError) {
            return this.handleError(input, result, timeCost);
        }

        // Success
        const message: GameMessage = {
            idiom: input,
            isUser: true,
            timestamp: now,
            timeCost
        };

        this.currentSession.messages.push(message);
        this.currentSession.score += 10;
        idiomLib.markUsed(input);
        this.lastMessageTime = now;
        this.saveSessions();

        if (this.currentSession.timeLimit && this.currentSession.timeLimit > 0) {
            this.resetTimer();
        }

        // Computer's turn - return a promise-like result
        return { success: true };
    }

    triggerComputerTurn(callback?: () => void) {
        setTimeout(() => {
            this.computerTurn();
            if (callback) callback();
        }, 500);
    }

    private handleError(input: string, errorType: RecordType, timeCost: number): { success: boolean; error: string; errorType: RecordType } {
        const errorMessage = this.getErrorMessage(errorType);
        const now = Date.now();

        const message: GameMessage = {
            idiom: input,
            isUser: true,
            timestamp: now,
            timeCost,
            isError: true,
            errorType
        };

        this.currentSession!.messages.push(message);
        // DON'T update lastMessageTime on errors - we want to track time from the last valid message

        switch (this.currentSession!.mode) {
            case GameMode.Endless:
                // In endless mode, just show error but continue - don't proceed to computer turn
                this.saveSessions();
                return { success: false, error: errorMessage, errorType };

            case GameMode.Challenge:
                // Check if has lives
                if (this.currentSession!.lives !== undefined) {
                    this.currentSession!.lives--;

                    if (this.currentSession!.lives <= 0) {
                        // No more lives, game over
                        this.endGame(errorMessage);
                        return { success: false, error: `${errorMessage} 游戏结束！`, errorType };
                    } else {
                        // Still have lives
                        this.saveSessions();
                        return { success: false, error: `${errorMessage} 剩余生命: ${this.currentSession!.lives}`, errorType };
                    }
                } else {
                    // No lives configured (classic mode behavior - 0 lives)
                    this.endGame(errorMessage);
                    return { success: false, error: `${errorMessage} 游戏结束！`, errorType };
                }

            default:
                this.endGame(errorMessage);
                return { success: false, error: `${errorMessage} 游戏结束！`, errorType };
        }
    }

    giveUp(): boolean {
        if (!this.currentSession || !this.currentSession.isActive) {
            return false;
        }

        if (this.currentSession.mode === GameMode.Endless) {
            // In endless mode, skip to computer's turn
            this.computerTurn();
            return true;
        }

        return false;
    }

    private computerTurn() {
        if (!this.currentSession || !this.currentSession.isActive) return;

        // Filter out error messages to get valid idiom history
        const history = this.currentSession.messages
            .filter(m => !m.isError)
            .map(m => m.idiom);

        const nextIdiom = idiomLib.pickNext(history);

        if (!nextIdiom) {
            this.endGame('恭喜！电脑无法接龙，你赢了！');
            return;
        }

        const now = Date.now();
        const message: GameMessage = {
            idiom: nextIdiom,
            isUser: false,
            timestamp: now,
            timeCost: now - this.lastMessageTime
        };

        this.currentSession.messages.push(message);
        idiomLib.markUsed(nextIdiom);
        this.lastMessageTime = now;
        this.saveSessions();

        if (this.currentSession.timeLimit && this.currentSession.timeLimit > 0) {
            this.resetTimer();
        }
    }

    private endGame(message: string) {
        if (!this.currentSession) return;

        this.currentSession.isActive = false;
        this.currentSession.endTime = Date.now();
        this.stopTimer();
        this.saveSessions();
        console.info('[GameManager] Game ended:', message);

        // Notify app to re-render
        if (this.onGameEndCallback) {
            this.onGameEndCallback();
        }
    }

    private getErrorMessage(type: RecordType): string {
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

    deleteSession(sessionId: string) {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        this.saveSessions();
    }

    clearAllSessions() {
        this.sessions = [];
        Storage.clearSessions();
    }
}
