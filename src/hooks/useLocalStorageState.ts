import { useState, useEffect, useCallback } from 'react';

function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [state, setState] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored !== null) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error(`[useLocalStorageState] Error reading ${key}:`, error);
        }
        return initialValue;
    });

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setState(prev => {
            const newValue = value instanceof Function ? value(prev) : value;
            try {
                localStorage.setItem(key, JSON.stringify(newValue));
            } catch (error) {
                console.error(`[useLocalStorageState] Error saving ${key}:`, error);
            }
            return newValue;
        });
    }, [key]);

    return [state, setValue];
}

export default useLocalStorageState;
