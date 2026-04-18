import { useCallback, useRef, useState } from 'react';
import { GameMessage, RecordType, GameMode } from '../types';

interface MessageBubbleProps {
    message: GameMessage;
    isFirst: boolean;
    mode: GameMode;
    onShowDetail: (idiom: string) => void;
    onShowCandidates: (idiom: string) => void;
}

function getErrorReason(errorType: RecordType): string {
    switch (errorType) {
        case RecordType.IdiomNotExist:
            return '成语不存在';
        case RecordType.IdiomDuplicate:
            return '成语已使用';
        case RecordType.PinyinNotMatch:
            return '拼音不匹配';
        default:
            return '未知错误';
    }
}

function MessageBubble({ message, isFirst, mode, onShowDetail, onShowCandidates }: MessageBubbleProps) {
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

    const shouldShowScore = message.isUser && !message.isError && !message.isGiveUp &&
        (mode === GameMode.Endless || mode === GameMode.LimitedTime) &&
        message.score !== undefined;

    const isGiveUpMessage = message.isUser && message.isGiveUp;
    const isIdiomNotExist = message.isError && message.errorType === RecordType.IdiomNotExist;

    if (isGiveUpMessage) {
        return (
            <div className="message user-message">
                <div className="message-bubble give-up-bubble">
                    {message.idiom}
                </div>
                <div className="message-time">
                    <span className="message-score message-score-negative">-10分</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`message ${message.isUser ? 'user-message' : 'computer-message'}`}>
            <div
                className={`message-bubble ${message.isError ? 'error-bubble' : ''} ${isIdiomNotExist ? 'no-interact' : ''}`}
                data-idiom={message.idiom}
                onMouseDown={isIdiomNotExist ? undefined : handleMouseDown}
                onTouchStart={isIdiomNotExist ? undefined : handleTouchStart}
                onTouchEnd={isIdiomNotExist ? undefined : handleTouchEnd}
                onTouchMove={isIdiomNotExist ? undefined : handleTouchMove}
                onContextMenu={isIdiomNotExist ? undefined : handleContextMenu}
                onClick={isIdiomNotExist ? undefined : handleClick}
            >
                {message.idiom}
            </div>
            {message.isUser && message.isError && message.errorType && (
                <div className="message-error-reason">{getErrorReason(message.errorType)}</div>
            )}
            {message.isUser && !message.isError && (
                <div className="message-time">
                    {timeStr}
                    {shouldShowScore && <span className="message-score">+{message.score}分</span>}
                </div>
            )}
            {isFirst && !message.isUser && !isIdiomNotExist && (
                <div className="message-hint">点击查看详情 · 长按查看候选</div>
            )}
        </div>
    );
}

export default MessageBubble;
