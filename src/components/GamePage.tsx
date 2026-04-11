import { useState, useEffect, useRef, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GameSession, GameMode, RecordType } from '../types';
import MessageBubble from './MessageBubble';

interface GamePageProps {
    session: GameSession;
    remainingTime: number;
    currentTurnStartTime: number;
    onBack: () => void;
    onSubmitIdiom: (input: string) => { success: boolean; error?: string; errorType?: RecordType };
    onGiveUp: () => void;
    onTriggerComputerTurn: (callback?: () => void) => void;
    onStartNewGame: (mode: GameMode, config?: { lives: number; timeLimit: number }) => void;
    onShowDetail: (idiom: string) => void;
    onShowCandidates: (idiom: string) => void;
}

function GamePage({
    session,
    remainingTime,
    currentTurnStartTime,
    onBack,
    onSubmitIdiom,
    onGiveUp,
    onTriggerComputerTurn,
    onStartNewGame,
    onShowDetail,
    onShowCandidates
}: GamePageProps) {
    const [input, setInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const modeNames = {
        [GameMode.Endless]: '无尽模式',
        [GameMode.Challenge]: '挑战模式'
    };

    let modeDisplay = modeNames[session.mode];
    if (session.mode === GameMode.Challenge && session.challengeConfig) {
        const parts = [];
        if (session.challengeConfig.lives > 0) {
            parts.push(`${session.challengeConfig.lives}命`);
        } else {
            parts.push('经典');
        }
        if (session.challengeConfig.timeLimit > 0) {
            parts.push(`${session.challengeConfig.timeLimit}秒`);
        }
        if (parts.length > 0) {
            modeDisplay += ` (${parts.join(', ')})`;
        }
    }

    useEffect(() => {
        if (session.isActive && (!session.timeLimit || session.timeLimit === 0)) {
            const interval = setInterval(() => {
                setCurrentTime(Math.floor((Date.now() - currentTurnStartTime) / 100) / 10);
            }, 100);
            return () => clearInterval(interval);
        }
    }, [session.isActive, session.timeLimit, currentTurnStartTime]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [session.messages.length]);

    useEffect(() => {
        if (session.isActive && inputRef.current && !isSubmitting) {
            inputRef.current.focus();
        }
    }, [session.isActive, session.messages.length, isSubmitting]);

    const handleSubmit = useCallback(async () => {
        if (!input.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const result = onSubmitIdiom(input.trim());

        setInput('');
        if (result.success) {
            onTriggerComputerTurn(() => {
                setIsSubmitting(false);
            });
            try {
                await Haptics.impact({ style: ImpactStyle.Medium });
            } catch (error) {
                console.warn('Unable to trigger haptic feedback', error);
            }
        } else {
            setIsSubmitting(false);
            try {
                await Haptics.impact({ style: ImpactStyle.Heavy });
            } catch (error) {
                console.warn('Unable to trigger haptic feedback', error);
            }
        }
    }, [input, isSubmitting, onSubmitIdiom, onTriggerComputerTurn]);

    const handleGiveUp = useCallback(async () => {
        onGiveUp();
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
            console.warn('Unable to trigger haptic feedback', error);
        }
    }, [onGiveUp]);

    const handleNewGame = useCallback(() => {
        onStartNewGame(session.mode, session.challengeConfig);
    }, [onStartNewGame, session.mode, session.challengeConfig]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const timerDisplay = session.timeLimit && session.timeLimit > 0
        ? `${remainingTime}s`
        : `${currentTime.toFixed(1)}s`;

    const isTimerWarning = session.timeLimit && session.timeLimit > 0 && remainingTime <= 5;

    const timerId = session.timeLimit && session.timeLimit > 0
        ? 'timer-display'
        : 'current-time-display';

    return (
        <div className="game-container">
            <header className="game-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>{modeDisplay}</h1>
                    {session.lives !== undefined && (
                        <p className="game-subtitle">{session.lives}/{session.maxLives} 命</p>
                    )}
                </div>
            </header>

            {session.isActive && (
                <div className="game-status-bar">
                    <span>得分: {session.score}</span>
                    <span
                        id={timerId}
                        className={`timer-display ${isTimerWarning ? 'timer-warning' : ''}`}
                    >
                        {timerDisplay}
                    </span>
                </div>
            )}

            <div className="chat-container" ref={chatContainerRef}>
                {session.messages.map((msg, index) => (
                    <MessageBubble
                        key={`${msg.timestamp}-${index}`}
                        message={msg}
                        isFirst={index === 0}
                        onShowDetail={onShowDetail}
                        onShowCandidates={onShowCandidates}
                    />
                ))}
            </div>

            {session.isActive ? (
                <div className="input-section">
                    <div className="input-group">
                        <input
                            ref={inputRef}
                            type="text"
                            id="idiom-input"
                            placeholder="请输入成语接龙..."
                            autoComplete="off"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSubmitting}
                        />
                        <button
                            className="btn btn-primary"
                            id="submit-btn"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !input.trim()}
                        >
                            发送
                        </button>
                        {session.mode === GameMode.Endless && (
                            <button
                                className="btn btn-secondary"
                                id="giveup-btn"
                                onClick={handleGiveUp}
                                disabled={isSubmitting}
                            >
                                放弃
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="game-over-section">
                    <div className="game-final-score">最终得分: {session.score}</div>
                    <button className="btn btn-primary" id="new-game-btn" onClick={handleNewGame}>
                        再来一局
                    </button>
                    <button className="btn btn-secondary" id="home-btn" onClick={onBack}>
                        返回主页
                    </button>
                </div>
            )}
        </div>
    );
}

export default GamePage;
