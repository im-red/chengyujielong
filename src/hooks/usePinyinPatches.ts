import { useCallback } from 'react';
import useLocalStorageState from './useLocalStorageState';
import { PinyinPatch } from '../types';

const PINYIN_PATCHES_KEY = 'chengyujielong:pinyin-patches';

export function usePinyinPatches() {
    const [patches, setPatches] = useLocalStorageState<PinyinPatch[]>(PINYIN_PATCHES_KEY, []);

    const addPatch = useCallback((idiom: string, originalPinyin: string, correctedPinyin: string) => {
        setPatches(prev => {
            const existingIndex = prev.findIndex(p => p.idiom === idiom);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    correctedPinyin,
                    createdAt: Date.now()
                };
                console.info('[usePinyinPatches] Updated patch for:', idiom);
                return updated;
            }
            const newPatch: PinyinPatch = {
                idiom,
                originalPinyin,
                correctedPinyin,
                createdAt: Date.now()
            };
            console.info('[usePinyinPatches] Added patch for:', idiom);
            return [...prev, newPatch];
        });
    }, [setPatches]);

    const removePatch = useCallback((idiom: string) => {
        setPatches(prev => {
            const filtered = prev.filter(p => p.idiom !== idiom);
            console.info('[usePinyinPatches] Removed patch for:', idiom);
            return filtered;
        });
    }, [setPatches]);

    const getPatch = useCallback((idiom: string): PinyinPatch | undefined => {
        return patches.find(p => p.idiom === idiom);
    }, [patches]);

    const clearAllPatches = useCallback(() => {
        setPatches([]);
        console.info('[usePinyinPatches] Cleared all patches');
    }, [setPatches]);

    return {
        patches,
        addPatch,
        removePatch,
        getPatch,
        clearAllPatches
    };
}
