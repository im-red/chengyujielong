import { useState, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { RecordType } from '../types';

interface UseIdiomSubmissionProps {
    onSubmitIdiom: (input: string) => { success: boolean; error?: string; errorType?: RecordType };
    onTriggerComputerTurn?: (callback?: () => void) => void;
}

interface UseIdiomSubmissionReturn {
    isSubmitting: boolean;
    submitIdiom: (input: string) => Promise<boolean>;
}

export function useIdiomSubmission({
    onSubmitIdiom,
    onTriggerComputerTurn
}: UseIdiomSubmissionProps): UseIdiomSubmissionReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitIdiom = useCallback(async (input: string): Promise<boolean> => {
        if (!input.trim() || isSubmitting) {
            return false;
        }

        setIsSubmitting(true);
        const result = onSubmitIdiom(input.trim());

        if (result.success) {
            if (onTriggerComputerTurn) {
                onTriggerComputerTurn(() => {
                    setIsSubmitting(false);
                });
            } else {
                setIsSubmitting(false);
            }
            try {
                await Haptics.impact({ style: ImpactStyle.Medium });
            } catch (error) {
                console.warn('Unable to trigger haptic feedback', error);
            }
            return true;
        } else {
            setIsSubmitting(false);
            try {
                await Haptics.impact({ style: ImpactStyle.Heavy });
            } catch (error) {
                console.warn('Unable to trigger haptic feedback', error);
            }
            return false;
        }
    }, [isSubmitting, onSubmitIdiom, onTriggerComputerTurn]);

    return {
        isSubmitting,
        submitIdiom
    };
}
