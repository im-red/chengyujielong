import { useCallback, useMemo } from 'react';
import useLocalStorageState from './useLocalStorageState';

export interface FavoriteItem {
    idiom: string;
    addedAt: number;
}

const FAVORITES_KEY = 'chengyujielong_favorites';

export function useFavorites(): {
    favorites: FavoriteItem[];
    isFavorite: (idiom: string) => boolean;
    addFavorite: (idiom: string) => void;
    removeFavorite: (idiom: string) => void;
    toggleFavorite: (idiom: string) => void;
    importFavorites: (favorites: FavoriteItem[]) => void;
    favoritesCount: number;
} {
    const [favorites, setFavorites] = useLocalStorageState<FavoriteItem[]>(FAVORITES_KEY, []);

    const isFavorite = useCallback((idiom: string) => {
        return favorites.some(f => f.idiom === idiom);
    }, [favorites]);

    const addFavorite = useCallback((idiom: string) => {
        setFavorites(prev => {
            if (prev.some(f => f.idiom === idiom)) {
                return prev;
            }
            return [...prev, { idiom, addedAt: Date.now() }];
        });
    }, [setFavorites]);

    const removeFavorite = useCallback((idiom: string) => {
        setFavorites(prev => prev.filter(f => f.idiom !== idiom));
    }, [setFavorites]);

    const toggleFavorite = useCallback((idiom: string) => {
        if (isFavorite(idiom)) {
            removeFavorite(idiom);
        } else {
            addFavorite(idiom);
        }
    }, [isFavorite, addFavorite, removeFavorite]);

    const importFavorites = useCallback((importedFavorites: FavoriteItem[]) => {
        setFavorites(importedFavorites);
    }, [setFavorites]);

    const favoritesCount = useMemo(() => favorites.length, [favorites]);

    return {
        favorites,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        importFavorites,
        favoritesCount
    };
}
