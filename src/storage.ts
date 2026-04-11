import { GameSession } from './types';

const STORAGE_KEY = 'chengyujielong_sessions';

export class Storage {
    static saveSessions(sessions: GameSession[]) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        } catch (error) {
            console.error('[Storage] Failed to save sessions:', error);
        }
    }

    static loadSessions(): GameSession[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];
            return JSON.parse(data);
        } catch (error) {
            console.error('[Storage] Failed to load sessions:', error);
            return [];
        }
    }

    static clearSessions() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('[Storage] Failed to clear sessions:', error);
        }
    }
}
