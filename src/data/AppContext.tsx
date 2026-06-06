import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { useGameState } from '../hooks/useGameState';
import { usePinyinPatches } from '../hooks/usePinyinPatches';
import { useFavorites } from '../hooks/useFavorites';
import { GameMode, LimitedTimeConfig, Player } from '../models';
import { idiomLib } from '../util/idiomLib';

interface AppContextType {
    gameState: ReturnType<typeof useGameState>[0];
    gameActions: ReturnType<typeof useGameState>[1];
    patches: ReturnType<typeof usePinyinPatches>['patches'];
    addPatch: ReturnType<typeof usePinyinPatches>['addPatch'];
    removePatch: ReturnType<typeof usePinyinPatches>['removePatch'];
    clearAllPatches: ReturnType<typeof usePinyinPatches>['clearAllPatches'];
    importPatches: ReturnType<typeof usePinyinPatches>['importPatches'];
    getPatch: ReturnType<typeof usePinyinPatches>['getPatch'];
    favorites: ReturnType<typeof useFavorites>['favorites'];
    isFavorite: ReturnType<typeof useFavorites>['isFavorite'];
    removeFavorite: ReturnType<typeof useFavorites>['removeFavorite'];
    toggleFavorite: ReturnType<typeof useFavorites>['toggleFavorite'];
    importFavorites: ReturnType<typeof useFavorites>['importFavorites'];
    favoritesCount: ReturnType<typeof useFavorites>['favoritesCount'];
    exportData: () => Promise<void>;
    importData: () => void;
    handleStartGame: (mode: GameMode, config?: LimitedTimeConfig) => Promise<void>;
    handleStartMultiplayerGame: (players: Player[]) => void;
    detailModalIdiom: string | null;
    detailModalSearchQuery: string;
    setDetailModalIdiom: (idiom: string | null, searchQuery?: string) => void;
    candidatesModalIdiom: string | null;
    setCandidatesModalIdiom: (idiom: string | null) => void;
    isGameOverModalOpen: boolean;
    setIsGameOverModalOpen: (open: boolean) => void;
    selectedSessionId: string | null;
    setSelectedSessionId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameState, gameActions] = useGameState();
    const { patches, addPatch, removePatch, clearAllPatches, importPatches, getPatch } = usePinyinPatches();
    const { favorites, isFavorite, removeFavorite, toggleFavorite, importFavorites, favoritesCount } = useFavorites();
    const [detailModalIdiom, setDetailModalIdiomRaw] = useState<string | null>(null);
    const [detailModalSearchQuery, setDetailModalSearchQuery] = useState<string>('');
    const [candidatesModalIdiom, setCandidatesModalIdiom] = useState<string | null>(null);
    const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    useEffect(() => {
        idiomLib.setPatches(patches);
    }, [patches]);

    const setDetailModalIdiom = useCallback((idiom: string | null, searchQuery?: string) => {
        setDetailModalIdiomRaw(idiom);
        setDetailModalSearchQuery(searchQuery || '');
    }, []);

    const handleStartGame = useCallback(async (mode: GameMode, config?: LimitedTimeConfig) => {
        gameActions.startNewGame(mode, config);
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
            console.warn('Unable to trigger haptic feedback', error);
        }
    }, [gameActions]);

    const handleStartMultiplayerGame = useCallback((players: Player[]) => {
        gameActions.startMultiplayerGame(players);
    }, [gameActions]);

    const exportData = useCallback(async () => {
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

    const importData = useCallback(() => {
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

    const value: AppContextType = {
        gameState,
        gameActions,
        patches,
        addPatch,
        removePatch,
        clearAllPatches,
        importPatches,
        getPatch,
        favorites,
        isFavorite,
        removeFavorite,
        toggleFavorite,
        importFavorites,
        favoritesCount,
        exportData,
        importData,
        handleStartGame,
        handleStartMultiplayerGame,
        detailModalIdiom,
        detailModalSearchQuery,
        setDetailModalIdiom,
        candidatesModalIdiom,
        setCandidatesModalIdiom,
        isGameOverModalOpen,
        setIsGameOverModalOpen,
        selectedSessionId,
        setSelectedSessionId,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
