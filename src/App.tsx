import { useState, useEffect, useRef, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App as CapacitorApp } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { useGameState } from './hooks/useGameState';
import { GameMode, ChallengeConfig, GameMessage, LimitedTimeConfig } from './types';
import { idiomLib } from './idiomLib';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import ChallengeConfigPage from './components/ChallengeConfigPage';
import LimitedTimeConfigPage from './components/LimitedTimeConfigPage';
import DetailModal from './components/DetailModal';
import CandidatesModal from './components/CandidatesModal';
import GameOverModal from './components/GameOverModal';

type ViewType = 'home' | 'game' | 'challengeConfig' | 'limitedTimeConfig';

function App() {
    const [view, setView] = useState<ViewType>('home');
    const [gameState, gameActions] = useGameState();
    const [detailModalIdiom, setDetailModalIdiom] = useState<string | null>(null);
    const [candidatesModalIdiom, setCandidatesModalIdiom] = useState<string | null>(null);
    const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

    const handleStartGame = useCallback(async (mode: GameMode, config?: ChallengeConfig | LimitedTimeConfig) => {
        gameActions.startNewGame(mode, config);
        setView('game');
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
            console.warn('Unable to trigger haptic feedback', error);
        }
    }, [gameActions]);

    const handleBack = useCallback(() => {
        if (isGameOverModalOpen) {
            setIsGameOverModalOpen(false);
            setView('home');
            return;
        }
        if (detailModalIdiom) {
            setDetailModalIdiom(null);
            return;
        }
        if (candidatesModalIdiom) {
            setCandidatesModalIdiom(null);
            return;
        }
        if (view === 'game') {
            setView('home');
        } else if (view === 'challengeConfig') {
            setView('home');
        } else if (view === 'limitedTimeConfig') {
            setView('home');
        }
    }, [view, detailModalIdiom, candidatesModalIdiom, isGameOverModalOpen]);

    useEffect(() => {
        let listener: PluginListenerHandle | undefined;
        let cancelled = false;

        const setup = async () => {
            const handle = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                if (isGameOverModalOpen) {
                    setIsGameOverModalOpen(false);
                    setView('home');
                    return;
                }
                if (detailModalIdiom) {
                    setDetailModalIdiom(null);
                    return;
                }
                if (candidatesModalIdiom) {
                    setCandidatesModalIdiom(null);
                    return;
                }
                if (view === 'game') {
                    setView('home');
                    return;
                }
                if (view === 'challengeConfig') {
                    setView('home');
                    return;
                }
                if (view === 'limitedTimeConfig') {
                    setView('home');
                    return;
                }
                if (canGoBack) {
                    window.history.back();
                } else {
                    CapacitorApp.exitApp();
                }
            });

            if (cancelled) {
                handle.remove();
            } else {
                listener = handle;
            }
        };

        setup();

        return () => {
            cancelled = true;
            if (listener) {
                listener.remove();
            }
        };
    }, [view, detailModalIdiom, candidatesModalIdiom, isGameOverModalOpen]);

    const handleShowDetail = useCallback((idiom: string) => {
        setDetailModalIdiom(idiom);
    }, []);

    const handleShowCandidates = useCallback((idiom: string) => {
        setCandidatesModalIdiom(idiom);
    }, []);

    const handleCloseDetail = useCallback(() => {
        setDetailModalIdiom(null);
    }, []);

    const handleCloseCandidates = useCallback(() => {
        setCandidatesModalIdiom(null);
    }, []);

    const handleSelectChallengeMode = useCallback(() => {
        setView('challengeConfig');
    }, []);

    const handleSelectLimitedTimeMode = useCallback(() => {
        setView('limitedTimeConfig');
    }, []);

    const handleSelectEndlessMode = useCallback(() => {
        handleStartGame(GameMode.Endless);
    }, [handleStartGame]);

    const handleGameOver = useCallback(() => {
        setIsGameOverModalOpen(true);
    }, []);

    const handleGameOverNewGame = useCallback(() => {
        setIsGameOverModalOpen(false);
        if (gameState.currentSession) {
            handleStartGame(gameState.currentSession.mode);
        }
    }, [gameState.currentSession, handleStartGame]);

    const handleGameOverGoHome = useCallback(() => {
        setIsGameOverModalOpen(false);
        setView('home');
    }, []);

    return (
        <>
            {view === 'home' && (
                <HomePage
                    sessions={gameState.sessions}
                    onSelectEndlessMode={handleSelectEndlessMode}
                    onSelectChallengeMode={handleSelectChallengeMode}
                    onSelectLimitedTimeMode={handleSelectLimitedTimeMode}
                    onDeleteSession={gameActions.deleteSession}
                    onClearAllSessions={gameActions.clearAllSessions}
                />
            )}

            {view === 'challengeConfig' && (
                <ChallengeConfigPage
                    onBack={() => setView('home')}
                    onStartGame={(config) => handleStartGame(GameMode.Challenge, config)}
                />
            )}

            {view === 'limitedTimeConfig' && (
                <LimitedTimeConfigPage
                    onBack={() => setView('home')}
                    onStartGame={(config) => handleStartGame(GameMode.LimitedTime, config)}
                />
            )}

            {view === 'game' && gameState.currentSession && (
                <GamePage
                    session={gameState.currentSession}
                    remainingTime={gameState.remainingTime}
                    currentTurnStartTime={gameState.currentTurnStartTime}
                    gameRemainingTime={gameState.gameRemainingTime}
                    onBack={() => setView('home')}
                    onSubmitIdiom={gameActions.submitIdiom}
                    onGiveUp={gameActions.giveUp}
                    onTriggerComputerTurn={gameActions.triggerComputerTurn}
                    onStartNewGame={(mode, config) => handleStartGame(mode, config)}
                    onShowDetail={handleShowDetail}
                    onShowCandidates={handleShowCandidates}
                    onGameOver={handleGameOver}
                />
            )}

            <DetailModal
                idiom={detailModalIdiom}
                onClose={handleCloseDetail}
            />

            <CandidatesModal
                idiom={candidatesModalIdiom}
                onClose={handleCloseCandidates}
                onShowDetail={handleShowDetail}
            />

            <GameOverModal
                isOpen={isGameOverModalOpen}
                score={gameState.currentSession?.score ?? 0}
                mode={gameState.currentSession?.mode ?? GameMode.Endless}
                onNewGame={handleGameOverNewGame}
                onGoHome={handleGameOverGoHome}
            />
        </>
    );
}

export default App;
