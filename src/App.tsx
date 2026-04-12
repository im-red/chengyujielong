import { useState, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App as CapacitorApp } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { useGameState } from './hooks/useGameState';
import { usePinyinPatches } from './hooks/usePinyinPatches';
import { GameMode, ChallengeConfig, LimitedTimeConfig } from './types';
import { idiomLib } from './idiomLib';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import ChallengeConfigPage from './components/ChallengeConfigPage';
import LimitedTimeConfigPage from './components/LimitedTimeConfigPage';
import DetailModal from './components/DetailModal';
import CandidatesModal from './components/CandidatesModal';
import GameOverModal from './components/GameOverModal';
import HistoryDetailPage from './components/HistoryDetailPage';
import PinyinPatchPage from './components/PinyinPatchPage';

type ViewType = 'home' | 'game' | 'challengeConfig' | 'limitedTimeConfig' | 'historyDetail' | 'pinyinPatch';

function App() {
    const [view, setView] = useState<ViewType>('home');
    const [gameState, gameActions] = useGameState();
    const { patches, addPatch, removePatch, clearAllPatches } = usePinyinPatches();
    const [detailModalIdiom, setDetailModalIdiom] = useState<string | null>(null);
    const [candidatesModalIdiom, setCandidatesModalIdiom] = useState<string | null>(null);
    const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    useEffect(() => {
        idiomLib.setPatches(patches);
    }, [patches]);

    const handleStartGame = useCallback(async (mode: GameMode, config?: ChallengeConfig | LimitedTimeConfig) => {
        gameActions.startNewGame(mode, config);
        setView('game');
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
            console.warn('Unable to trigger haptic feedback', error);
        }
    }, [gameActions]);

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
                if (view === 'historyDetail') {
                    setSelectedSessionId(null);
                    setView('home');
                    return;
                }
                if (view === 'pinyinPatch') {
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

    const handleViewSession = useCallback((sessionId: string) => {
        setSelectedSessionId(sessionId);
        setView('historyDetail');
    }, []);

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
                    onViewSession={handleViewSession}
                    patchesCount={patches.length}
                    onViewPinyinPatches={() => setView('pinyinPatch')}
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

            {view === 'historyDetail' && selectedSessionId && (
                <HistoryDetailPage
                    session={gameState.sessions.find(s => s.id === selectedSessionId)!}
                    onBack={() => {
                        setSelectedSessionId(null);
                        setView('home');
                    }}
                    onShowDetail={handleShowDetail}
                    onShowCandidates={handleShowCandidates}
                />
            )}

            {view === 'pinyinPatch' && (
                <PinyinPatchPage
                    patches={patches}
                    onBack={() => setView('home')}
                    onRemovePatch={removePatch}
                    onClearAllPatches={clearAllPatches}
                />
            )}

            <DetailModal
                idiom={detailModalIdiom}
                onClose={handleCloseDetail}
                onAddPatch={addPatch}
                onRemovePatch={removePatch}
                getPatch={(idiom) => patches.find(p => p.idiom === idiom)}
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
