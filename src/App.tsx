import { useState, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import type { PluginListenerHandle } from '@capacitor/core';
import { useGameState } from './hooks/useGameState';
import { usePinyinPatches } from './hooks/usePinyinPatches';
import { useFavorites } from './hooks/useFavorites';
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
import IdiomLibraryPage from './components/IdiomLibraryPage';
import TrendPage from './components/TrendPage';
import FavoritesPage from './components/FavoritesPage';

type ViewType = 'home' | 'game' | 'challengeConfig' | 'limitedTimeConfig' | 'historyDetail' | 'pinyinPatch' | 'idiomLibrary' | 'trend' | 'favorites';

function App() {
    const [view, setView] = useState<ViewType>('home');
    const [gameState, gameActions] = useGameState();
    const { patches, addPatch, removePatch, clearAllPatches, importPatches, getPatch } = usePinyinPatches();
    const { favorites, isFavorite, removeFavorite, toggleFavorite, importFavorites, favoritesCount } = useFavorites();
    const [detailModalIdiom, setDetailModalIdiom] = useState<string | null>(null);
    const [detailModalSearchQuery, setDetailModalSearchQuery] = useState<string>('');
    const [candidatesModalIdiom, setCandidatesModalIdiom] = useState<string | null>(null);
    const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

    useEffect(() => {
        idiomLib.setPatches(patches);
    }, [patches]);

    useEffect(() => {
        // Hide splash screen once the app component is mounted and idioms are available
        const hideSplash = async () => {
            try {
                await SplashScreen.hide();
            } catch (err) {
                console.warn('Error hiding splash screen', err);
            }
        };
        hideSplash();
    }, []);

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
                if (isSideMenuOpen) {
                    setIsSideMenuOpen(false);
                    return;
                }
                if (isGameOverModalOpen) {
                    setIsGameOverModalOpen(false);
                    if (gameState.currentSession) {
                        setSelectedSessionId(gameState.currentSession.id);
                        setView('historyDetail');
                    }
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
                if (view === 'idiomLibrary') {
                    setView('home');
                    return;
                }
                if (view === 'trend') {
                    setView('home');
                    return;
                }
                if (view === 'favorites') {
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
    }, [view, detailModalIdiom, candidatesModalIdiom, isGameOverModalOpen, gameState.currentSession, isSideMenuOpen]);

    const handleShowDetail = useCallback((idiom: string, searchQuery?: string) => {
        setDetailModalIdiom(idiom);
        setDetailModalSearchQuery(searchQuery || '');
    }, []);

    const handleShowCandidates = useCallback((idiom: string) => {
        setCandidatesModalIdiom(idiom);
    }, []);

    const handleCloseDetail = useCallback(() => {
        setDetailModalIdiom(null);
        setDetailModalSearchQuery('');
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

    const handleGameOverClose = useCallback(() => {
        setIsGameOverModalOpen(false);
        if (gameState.currentSession) {
            setSelectedSessionId(gameState.currentSession.id);
            setView('historyDetail');
        }
    }, [gameState.currentSession]);

    const handleGameOverGoHome = useCallback(() => {
        setIsGameOverModalOpen(false);
        setView('home');
    }, []);

    const handleExportData = useCallback(async () => {
        const data = {
            sessions: gameState.sessions,
            patches,
            favorites
        };
        const jsonStr = JSON.stringify(data, null, 2);

        const now = new Date();
        const dateString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `chengyujielong_${dateString}.json`;

        if (Capacitor.isNativePlatform()) {
            try {
                await Filesystem.writeFile({
                    path: fileName,
                    data: jsonStr,
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8
                });
                alert(`数据已导出至 Documents/${fileName}`);
            } catch (e) {
                console.error('Export failed on native', e);
                alert('导出失败: ' + (e instanceof Error ? e.message : String(e)));
            }
        } else {
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [gameState.sessions, patches, favorites]);

    const handleImportData = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const parsed = JSON.parse(content);
                    if (parsed.sessions && Array.isArray(parsed.sessions)) {
                        gameActions.importSessions(parsed.sessions);
                    }
                    if (parsed.patches && Array.isArray(parsed.patches)) {
                        importPatches(parsed.patches);
                    }
                    if (parsed.favorites && Array.isArray(parsed.favorites)) {
                        importFavorites(parsed.favorites);
                    }
                    alert('导入成功！');
                } catch (err) {
                    console.error('Import failed', err);
                    alert('导入失败，文件格式可能不正确。');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [gameActions, importPatches, importFavorites]);

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
                    onViewIdiomLibrary={() => setView('idiomLibrary')}
                    onViewTrend={() => setView('trend')}
                    onViewFavorites={() => setView('favorites')}
                    favoritesCount={favoritesCount}
                    isSideMenuOpen={isSideMenuOpen}
                    setIsSideMenuOpen={setIsSideMenuOpen}
                    onExportData={handleExportData}
                    onImportData={handleImportData}
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

            {view === 'idiomLibrary' && (
                <IdiomLibraryPage
                    onBack={() => setView('home')}
                    onShowDetail={handleShowDetail}
                />
            )}

            {view === 'trend' && (
                <TrendPage
                    sessions={gameState.sessions}
                    onBack={() => setView('home')}
                />
            )}

            {view === 'favorites' && (
                <FavoritesPage
                    favorites={favorites}
                    onBack={() => setView('home')}
                    onShowDetail={handleShowDetail}
                    onRemoveFavorite={removeFavorite}
                />
            )}

            <DetailModal
                idiom={detailModalIdiom}
                onClose={handleCloseDetail}
                onAddPatch={addPatch}
                onRemovePatch={removePatch}
                getPatch={getPatch}
                searchQuery={detailModalSearchQuery}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
            />

            <CandidatesModal
                idiom={candidatesModalIdiom}
                onClose={handleCloseCandidates}
                onShowDetail={handleShowDetail}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
            />

            <GameOverModal
                isOpen={isGameOverModalOpen}
                score={gameState.currentSession?.score ?? 0}
                mode={gameState.currentSession?.mode ?? GameMode.Endless}
                onClose={handleGameOverClose}
                onGoHome={handleGameOverGoHome}
            />
        </>
    );
}

export default App;
