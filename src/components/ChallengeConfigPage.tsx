import { useState } from 'react';
import { ChallengeConfig } from '../types';

interface ChallengeConfigPageProps {
    onBack: () => void;
    onStartGame: (config: ChallengeConfig) => void;
}

function ChallengeConfigPage({ onBack, onStartGame }: ChallengeConfigPageProps) {
    const [lives, setLives] = useState(3);
    const [timeLimit, setTimeLimit] = useState(0);

    const handleStart = () => {
        onStartGame({ lives, timeLimit });
    };

    return (
        <div className="home-container">
            <header className="app-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>挑战模式配置</h1>
                </div>
            </header>

            <div className="home-content">
                <p className="subtitle">自定义游戏难度</p>

                <div className="config-form">
                    <div className="config-section">
                        <label className="config-label">
                            <span className="label-text">生命次数</span>
                            <span className="label-hint">设为 0 表示答错即结束</span>
                        </label>
                        <div className="config-input-group">
                            <button
                                className="btn-adjust"
                                onClick={() => setLives(Math.max(0, lives - 1))}
                            >
                                -
                            </button>
                            <input
                                id="lives-input"
                                type="number"
                                className="config-input"
                                value={lives}
                                min={0}
                                max={10}
                                onChange={(e) => setLives(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                            />
                            <button
                                className="btn-adjust"
                                onClick={() => setLives(Math.min(10, lives + 1))}
                            >
                                +
                            </button>
                        </div>
                        <div className="preset-buttons">
                            <button className="btn-preset" onClick={() => setLives(0)}>经典 (0命)</button>
                            <button className="btn-preset" onClick={() => setLives(3)}>简单 (3命)</button>
                            <button className="btn-preset" onClick={() => setLives(5)}>中等 (5命)</button>
                        </div>
                    </div>

                    <div className="config-section">
                        <label className="config-label">
                            <span className="label-text">时间限制 (秒)</span>
                            <span className="label-hint">设为 0 表示无时间限制</span>
                        </label>
                        <div className="config-input-group">
                            <button
                                className="btn-adjust"
                                onClick={() => setTimeLimit(Math.max(0, timeLimit - 5))}
                            >
                                -
                            </button>
                            <input
                                id="time-input"
                                type="number"
                                className="config-input"
                                value={timeLimit}
                                min={0}
                                max={120}
                                step={5}
                                onChange={(e) => setTimeLimit(Math.max(0, Math.min(120, parseInt(e.target.value) || 0)))}
                            />
                            <button
                                className="btn-adjust"
                                onClick={() => setTimeLimit(Math.min(120, timeLimit + 5))}
                            >
                                +
                            </button>
                        </div>
                        <div className="preset-buttons">
                            <button className="btn-preset" onClick={() => setTimeLimit(0)}>无限制</button>
                            <button className="btn-preset" onClick={() => setTimeLimit(15)}>快速 (15秒)</button>
                            <button className="btn-preset" onClick={() => setTimeLimit(30)}>标准 (30秒)</button>
                            <button className="btn-preset" onClick={() => setTimeLimit(60)}>宽松 (60秒)</button>
                        </div>
                    </div>

                    <button id="start-challenge-btn" className="btn btn-primary btn-large" onClick={handleStart}>
                        开始游戏
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChallengeConfigPage;
