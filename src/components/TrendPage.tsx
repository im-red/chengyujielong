import { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { GameSession, GameMode, ChallengeConfig, LimitedTimeConfig } from '../types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

type TabType = 'limitedTime' | 'challenge';

interface TrendPageProps {
    sessions: GameSession[];
    onBack: () => void;
}

function TrendPage({ sessions, onBack }: TrendPageProps) {
    const [activeTab, setActiveTab] = useState<TabType>('limitedTime');

    const limitedTimeSessions = useMemo(() => 
        sessions.filter(s => s.mode === GameMode.LimitedTime && s.endTime),
        [sessions]
    );

    const challengeSessions = useMemo(() => 
        sessions.filter(s => s.mode === GameMode.Challenge && s.endTime),
        [sessions]
    );

    const currentSessions = activeTab === 'limitedTime' ? limitedTimeSessions : challengeSessions;

    return (
        <div className="home-container">
            <header className="app-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>成绩趋势</h1>
                </div>
            </header>

            <div className="trend-content">
                <div className="trend-tabs">
                    <button 
                        className={`trend-tab ${activeTab === 'limitedTime' ? 'trend-tab--active' : ''}`}
                        onClick={() => setActiveTab('limitedTime')}
                    >
                        限时模式
                    </button>
                    <button 
                        className={`trend-tab ${activeTab === 'challenge' ? 'trend-tab--active' : ''}`}
                        onClick={() => setActiveTab('challenge')}
                    >
                        挑战模式
                    </button>
                </div>

                {currentSessions.length === 0 ? (
                    <div className="trend-empty">
                        <p>暂无{activeTab === 'limitedTime' ? '限时模式' : '挑战模式'}的游戏记录</p>
                    </div>
                ) : (
                    <TrendChart sessions={currentSessions} mode={activeTab} />
                )}
            </div>
        </div>
    );
}

interface TrendChartProps {
    sessions: GameSession[];
    mode: TabType;
}

function TrendChart({ sessions, mode }: TrendChartProps) {
    const configs = useMemo(() => {
        const configMap = new Map<string, { label: string; config: ChallengeConfig | LimitedTimeConfig }>();
        
        sessions.forEach(session => {
            if (mode === 'limitedTime' && session.limitedTimeConfig) {
                const key = `${session.limitedTimeConfig.gameTimeLimit}`;
                if (!configMap.has(key)) {
                    const mins = Math.floor(session.limitedTimeConfig.gameTimeLimit / 60);
                    const secs = session.limitedTimeConfig.gameTimeLimit % 60;
                    let label: string;
                    if (mins > 0 && secs > 0) {
                        label = `${mins}分${secs}秒`;
                    } else if (mins > 0) {
                        label = `${mins}分钟`;
                    } else {
                        label = `${secs}秒`;
                    }
                    configMap.set(key, { label, config: session.limitedTimeConfig });
                }
            } else if (mode === 'challenge' && session.challengeConfig) {
                const key = `${session.challengeConfig.lives}-${session.challengeConfig.timeLimit}`;
                if (!configMap.has(key)) {
                    const parts: string[] = [];
                    if (session.challengeConfig.lives > 0) {
                        parts.push(`${session.challengeConfig.lives}命`);
                    } else {
                        parts.push('经典');
                    }
                    if (session.challengeConfig.timeLimit > 0) {
                        parts.push(`${session.challengeConfig.timeLimit}秒`);
                    } else {
                        parts.push('无时限');
                    }
                    configMap.set(key, { label: parts.join(', '), config: session.challengeConfig });
                }
            }
        });
        
        return Array.from(configMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [sessions, mode]);

    const [selectedConfigIndex, setSelectedConfigIndex] = useState(0);

    const selectedConfig = configs[selectedConfigIndex]?.config;

    const filteredSessions = useMemo(() => {
        if (!selectedConfig) return [];
        
        return sessions.filter(session => {
            if (mode === 'limitedTime' && session.limitedTimeConfig) {
                return session.limitedTimeConfig.gameTimeLimit === (selectedConfig as LimitedTimeConfig).gameTimeLimit;
            } else if (mode === 'challenge' && session.challengeConfig) {
                const config = selectedConfig as ChallengeConfig;
                return session.challengeConfig.lives === config.lives && 
                       session.challengeConfig.timeLimit === config.timeLimit;
            }
            return false;
        }).sort((a, b) => a.startTime - b.startTime);
    }, [sessions, selectedConfig, mode]);

    const chartData = useMemo(() => {
        const labels = filteredSessions.map((_, index) => `#${index + 1}`);
        const scores = filteredSessions.map(s => s.score);
        
        return {
            labels,
            datasets: [
                {
                    label: '得分',
                    data: scores,
                    borderColor: '#3880ff',
                    backgroundColor: 'rgba(56, 128, 255, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#3880ff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        };
    }, [filteredSessions]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    title: (items: { label: string }[]) => {
                        const index = parseInt(items[0].label.replace('#', '')) - 1;
                        const session = filteredSessions[index];
                        if (session) {
                            const date = new Date(session.startTime);
                            return date.toLocaleDateString('zh-CN');
                        }
                        return items[0].label;
                    },
                    label: (context: { parsed: { y: number } }) => `得分: ${context.parsed.y}`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#666666',
                    font: { size: 12 }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    color: '#666666',
                    font: { size: 12 }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const
        }
    }), [filteredSessions]);

    const stats = useMemo(() => {
        if (filteredSessions.length === 0) return null;
        
        const scores = filteredSessions.map(s => s.score);
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        
        return { avg, max, min, count: scores.length };
    }, [filteredSessions]);

    return (
        <div className="trend-chart-container">
            <div className="trend-config-selector">
                <label className="trend-config-label">配置筛选:</label>
                <select 
                    className="trend-config-select"
                    value={selectedConfigIndex}
                    onChange={(e) => setSelectedConfigIndex(parseInt(e.target.value))}
                >
                    {configs.map((config, index) => (
                        <option key={index} value={index}>{config.label}</option>
                    ))}
                </select>
            </div>

            {stats && (
                <div className="trend-stats">
                    <div className="trend-stat-item">
                        <span className="trend-stat-value">{stats.count}</span>
                        <span className="trend-stat-label">游戏次数</span>
                    </div>
                    <div className="trend-stat-item">
                        <span className="trend-stat-value">{stats.avg}</span>
                        <span className="trend-stat-label">平均分</span>
                    </div>
                    <div className="trend-stat-item">
                        <span className="trend-stat-value trend-stat-value--highlight">{stats.max}</span>
                        <span className="trend-stat-label">最高分</span>
                    </div>
                    <div className="trend-stat-item">
                        <span className="trend-stat-value">{stats.min}</span>
                        <span className="trend-stat-label">最低分</span>
                    </div>
                </div>
            )}

            <div className="trend-chart">
                <Line data={chartData} options={chartOptions} />
            </div>

            <div className="trend-history">
                <h3>历史记录</h3>
                <div className="trend-history-list">
                    {filteredSessions.slice().reverse().map((session, index) => (
                        <div key={session.id} className="trend-history-item">
                            <div className="trend-history-rank">#{filteredSessions.length - index}</div>
                            <div className="trend-history-info">
                                <div className="trend-history-score">得分: {session.score}</div>
                                <div className="trend-history-date">
                                    {new Date(session.startTime).toLocaleString('zh-CN')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TrendPage;
