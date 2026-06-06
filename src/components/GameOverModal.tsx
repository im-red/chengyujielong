import { GameMode } from '../models';
import './GameOverModal.scss';

interface GameOverModalProps {
    isOpen: boolean;
    score: number;
    mode: GameMode;
    onClose: () => void;
    onGoHome: () => void;
}

function GameOverModal({ isOpen, score, mode, onClose, onGoHome }: GameOverModalProps) {
    const getModeName = (mode: GameMode): string => {
        switch (mode) {
            case GameMode.Endless:
                return '无尽模式';
            case GameMode.LimitedTime:
                return '限时模式';
            default:
                return '游戏';
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="game-over-container">
            <h2 className="game-over-title">游戏结束</h2>
            <div className="game-over-mode">
                {getModeName(mode)}
            </div>
            <div className="game-over-score-container">
                <div className="game-over-score-label">最终得分</div>
                <div className="game-over-score-value">
                    {score}
                </div>
            </div>
            <div className="game-over-actions">
                <button
                    id="home-btn"
                    onClick={onGoHome}
                    className="btn-go-home"
                >
                    返回主页
                </button>
                <button
                    id="game-over-close-btn"
                    onClick={onClose}
                    className="btn-view-details"
                >
                    查看详情
                </button>
            </div>
        </div>
    );
}

export default GameOverModal;
