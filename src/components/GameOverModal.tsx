import { useEffect, useCallback, useRef } from 'react';
import { GameMode } from '../types';

interface GameOverModalProps {
    isOpen: boolean;
    score: number;
    mode: GameMode;
    onClose: () => void;
    onGoHome: () => void;
}

function GameOverModal({ isOpen, score, mode, onClose, onGoHome }: GameOverModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    const getModeName = (mode: GameMode): string => {
        switch (mode) {
            case GameMode.Endless:
                return '无尽模式';
            case GameMode.Challenge:
                return '挑战模式';
            case GameMode.LimitedTime:
                return '限时模式';
            default:
                return '游戏';
        }
    };

    const handleBackdropClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (e.target === modalRef.current) {
            e.preventDefault();
            onClose();
        }
    }, [onClose]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.target === modalRef.current) {
            e.preventDefault();
        }
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.target === modalRef.current) {
            e.preventDefault();
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            id="game-over-modal"
            ref={modalRef}
            className="modal show"
            onClick={handleBackdropClick}
            onTouchEnd={handleBackdropClick}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="modal-content game-over-modal-content">
                <button
                    className="close-modal"
                    id="game-over-close-btn"
                    onClick={onClose}
                    aria-label="关闭"
                >
                    ×
                </button>
                <h2 className="game-over-title">游戏结束</h2>
                <div className="game-over-mode">{getModeName(mode)}</div>
                <div className="game-over-score">
                    <span className="game-over-score-label">最终得分</span>
                    <span className="game-over-score-value">{score}</span>
                </div>
                <div className="game-over-buttons">
                    <button
                        className="btn btn-secondary"
                        id="home-btn"
                        onClick={onGoHome}
                    >
                        返回主页
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOverModal;
