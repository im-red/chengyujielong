import { useState } from 'react';
import { LimitedTimeConfig } from '../types';

interface LimitedTimeConfigPageProps {
    onBack: () => void;
    onStartGame: (config: LimitedTimeConfig) => void;
}

function LimitedTimeConfigPage({ onBack, onStartGame }: LimitedTimeConfigPageProps) {
    const [gameTimeLimit, setGameTimeLimit] = useState(120);

    const handleStart = () => {
        onStartGame({ gameTimeLimit });
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0 && secs > 0) {
            return `${mins}分${secs}秒`;
        } else if (mins > 0) {
            return `${mins}分钟`;
        }
        return `${secs}秒`;
    };

    return (
        <div className="home-container">
            <header className="app-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>限时模式配置</h1>
                </div>
            </header>

            <div className="home-content">
                <p className="subtitle">设置游戏总时长</p>

                <div className="config-form">
                    <div className="config-section">
                        <label className="config-label">
                            <span className="label-text">游戏时长</span>
                            <span className="label-hint">时间结束后游戏结束</span>
                        </label>
                        <div className="config-input-group">
                            <button
                                className="btn-adjust"
                                onClick={() => setGameTimeLimit(Math.max(30, gameTimeLimit - 30))}
                            >
                                -
                            </button>
                            <input
                                id="game-time-input"
                                type="text"
                                className="config-input"
                                value={formatTime(gameTimeLimit)}
                                readOnly
                            />
                            <button
                                className="btn-adjust"
                                onClick={() => setGameTimeLimit(Math.min(600, gameTimeLimit + 30))}
                            >
                                +
                            </button>
                        </div>
                        <div className="preset-buttons">
                            <button className="btn-preset" onClick={() => setGameTimeLimit(60)}>1分钟</button>
                            <button className="btn-preset" onClick={() => setGameTimeLimit(120)}>2分钟</button>
                            <button className="btn-preset" onClick={() => setGameTimeLimit(180)}>3分钟</button>
                            <button className="btn-preset" onClick={() => setGameTimeLimit(300)}>5分钟</button>
                        </div>
                    </div>

                    <button id="start-limited-time-btn" className="btn btn-primary btn-large" onClick={handleStart}>
                        开始游戏
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LimitedTimeConfigPage;
