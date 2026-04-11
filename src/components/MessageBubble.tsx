import { useCallback, useRef, useState } from 'react';
import { GameMessage } from '../types';

interface MessageBubbleProps {
    message: GameMessage;
    isFirst: boolean;
    onShowDetail: (idiom: string) => void;
    onShowCandidates: (idiom: string) => void;
}

function MessageBubble({ message, isFirst, onShowDetail, onShowCandidates }: MessageBubbleProps) {
    const longPressTimerRef = useRef<number | null>(null);
    const [isLongPress, setIsLongPress] = useState(false);
    const LONG_PRESS_DURATION = 500;

    const formatTimeCost = (ms: number): string => {
        const seconds = Math.floor(ms / 100) / 10;
        return `${seconds.toFixed(1)}s`;
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        setIsLongPress(false);
        longPressTimerRef.current = window.setTimeout(() => {
            setIsLongPress(true);
            onShowCandidates(message.idiom);
        }, LONG_PRESS_DURATION);
    }, [message.idiom, onShowCandidates]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        if (!isLongPress) {
            onShowDetail(message.idiom);
        }
    }, [isLongPress, message.idiom, onShowDetail]);

    const handleTouchMove = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        setIsLongPress(false);
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onShowCandidates(message.idiom);
    }, [message.idiom, onShowCandidates]);

    const handleClick = useCallback(() => {
        onShowDetail(message.idiom);
    }, [message.idiom, onShowDetail]);

    const timeStr = formatTimeCost(message.timeCost);

    return (
        <div className={`message ${message.isUser ? 'user-message' : 'computer-message'}`}>
            <div
                className={`message-bubble ${message.isError ? 'error-bubble' : ''}`}
                data-idiom={message.idiom}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onContextMenu={handleContextMenu}
                onClick={handleClick}
            >
                {message.idiom}
            </div>
            {message.isUser && !message.isError && (
                <div className="message-time">{timeStr}</div>
            )}
            {isFirst && !message.isUser && (
                <div className="message-hint">点击查看详情 · 长按查看候选</div>
            )}
        </div>
    );
}

export default MessageBubble;
