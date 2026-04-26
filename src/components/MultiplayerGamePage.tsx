import { useState, useEffect, useRef, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GameSession, RecordType, Player } from '../types';
import ChatContainer from './ChatContainer';
import IdiomInput from './IdiomInput';
import ScoreBoard from './ScoreBoard';
import PlayerAvatar from './PlayerAvatar';
import { useIdiomSubmission } from '../hooks/useIdiomSubmission';
import './MultiplayerGamePage.css';

interface MultiplayerGamePageProps {
    session: GameSession;
    currentTurnStartTime: number;
    onBack: () => void;
    onSubmitIdiom: (input: string) => { success: boolean; error?: string; errorType?: RecordType };
    onGiveUp: () => void;
    onShowDetail: (idiom: string) => void;
    onShowCandidates: (idiom: string) => void;
    onGameOver: () => void;
    getCurrentPlayer: () => Player | null;
}

function MultiplayerGamePage({
    session,
    currentTurnStartTime,
    onBack,
    onSubmitIdiom,
    onGiveUp,
    onShowDetail,
    onShowCandidates,
    onGameOver,
    getCurrentPlayer
}: MultiplayerGamePageProps) {
    const [input, setInput] = useState('');
    const [currentTime, setCurrentTime] = useState(0);

    const { isSubmitting, submitIdiom } = useIdiomSubmission({
        onSubmitIdiom
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Math.floor((Date.now() - currentTurnStartTime) / 100) / 10);
        }, 100);
        return () => clearInterval(interval);
    }, [currentTurnStartTime]);

    const wasActiveRef = useRef(session.isActive);
    useEffect(() => {
        if (wasActiveRef.current && !session.isActive) {
            onGameOver();
        }
        wasActiveRef.current = session.isActive;
    }, [session.isActive, onGameOver]);

    const handleSubmit = useCallback(async () => {
        await submitIdiom(input);
        setInput('');
    }, [input, submitIdiom]);

    const handleGiveUp = useCallback(async () => {
        onGiveUp();
        setInput('');
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
            console.warn('Unable to trigger haptic feedback', error);
        }
    }, [onGiveUp]);

    const currentPlayer = getCurrentPlayer();
    const players = session.players || [];

    return (
        <div className="game-container">
            <header className="game-header">
                <button id="back-btn" className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>多人模式</h1>
                </div>
            </header>

            {session.isActive && currentPlayer && (
                <ScoreBoard
                    players={players}
                    currentPlayerId={currentPlayer.id}
                    compact={false}
                />
            )}

            {session.isActive && currentPlayer && (
                <div className="current-turn-indicator">
                    <PlayerAvatar player={currentPlayer} size="small" />
                    <span className="current-turn-name">{currentPlayer.name} 的回合</span>
                    <span className="current-turn-time">{currentTime.toFixed(1)}s</span>
                </div>
            )}

            <ChatContainer
                messages={session.messages}
                mode={session.mode}
                onShowDetail={onShowDetail}
                onShowCandidates={onShowCandidates}
                players={players}
            />

            {session.isActive && session.messages.length === 0 && currentPlayer && (
                <div className="first-turn-hint">
                    <PlayerAvatar player={currentPlayer} size="medium" />
                    <div className="first-turn-hint-text">
                        <strong>{currentPlayer.name}</strong> 先手
                        <br />
                        <span className="first-turn-hint-sub">请输入任意成语开始游戏</span>
                    </div>
                </div>
            )}

            {session.isActive && currentPlayer && (
                <div className="multiplayer-input-section">
                    <div className="multiplayer-input-header">
                        <PlayerAvatar player={currentPlayer} size="small" />
                        <span className="multiplayer-input-name">{currentPlayer.name}</span>
                    </div>
                    <IdiomInput
                        input={input}
                        isSubmitting={isSubmitting}
                        mode={session.mode}
                        onInputChange={setInput}
                        onSubmit={handleSubmit}
                        onGiveUp={handleGiveUp}
                        showGiveUp={true}
                    />
                </div>
            )}

            {!session.isActive && (
                <div className="game-over-overlay">
                    <div className="game-over-content">
                        <h2>游戏结束</h2>
                        <ScoreBoard
                            players={players}
                            compact={false}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={onBack}
                        >
                            返回主页
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MultiplayerGamePage;
