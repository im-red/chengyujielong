import { GameSession, GameMode } from '../types';

interface HomePageProps {
    sessions: GameSession[];
    onSelectEndlessMode: () => void;
    onSelectChallengeMode: () => void;
    onDeleteSession: (sessionId: string) => void;
    onClearAllSessions: () => void;
}

function HomePage({
    sessions,
    onSelectEndlessMode,
    onSelectChallengeMode,
    onDeleteSession,
    onClearAllSessions
}: HomePageProps) {
    const handleClearHistory = () => {
        if (confirm('确定要清空所有历史记录吗？')) {
            onClearAllSessions();
        }
    };

    const handleDeleteSession = (sessionId: string) => {
        if (confirm('确定要删除这条记录吗？')) {
            onDeleteSession(sessionId);
        }
    };

    return (
        <div className="home-container">
            <header className="app-header">
                <div className="header-title">
                    <h1>成语接龙</h1>
                </div>
            </header>

            <div className="home-content">
                <p className="subtitle">选择游戏模式开始新游戏</p>

                <div className="mode-selection">
                    <div className="mode-card" data-mode={GameMode.Endless} onClick={onSelectEndlessMode}>
                        <div className="mode-icon">♾️</div>
                        <h3>无尽模式</h3>
                        <p>可放弃，永不结束</p>
                    </div>

                    <div className="mode-card" data-mode={GameMode.Challenge} onClick={onSelectChallengeMode}>
                        <div className="mode-icon">🎯</div>
                        <h3>挑战模式</h3>
                        <p>自定义生命和时限</p>
                    </div>
                </div>

                <div className="history-section">
                    <div className="history-header">
                        <h2>历史记录</h2>
                        {sessions.length > 0 && (
                            <button className="btn btn-text" onClick={handleClearHistory}>
                                清空
                            </button>
                        )}
                    </div>

                    {sessions.length === 0 ? (
                        <div className="empty-state">
                            <p>暂无游戏记录</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {sessions.map(session => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    onDelete={() => handleDeleteSession(session.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SessionCard({ session, onDelete }: { session: GameSession; onDelete: () => void }) {
    const duration = session.endTime
        ? Math.floor((session.endTime - session.startTime) / 1000)
        : 0;
    const date = new Date(session.startTime);
    const modeNames = {
        [GameMode.Endless]: '无尽',
        [GameMode.Challenge]: '挑战'
    };

    let configStr = '';
    if (session.mode === GameMode.Challenge && session.challengeConfig) {
        const parts = [];
        if (session.challengeConfig.lives > 0) {
            parts.push(`${session.challengeConfig.lives}命`);
        }
        if (session.challengeConfig.timeLimit > 0) {
            parts.push(`${session.challengeConfig.timeLimit}秒`);
        }
        if (parts.length > 0) {
            configStr = ` (${parts.join(', ')})`;
        }
    }

    return (
        <div className="session-card">
            <div className="session-info">
                <div className="session-mode">{modeNames[session.mode]}{configStr}</div>
                <div className="session-stats">
                    <span>得分: {session.score}</span>
                    <span>回合: {session.messages.length}</span>
                    {duration > 0 && <span>时长: {duration}s</span>}
                </div>
                <div className="session-date">{date.toLocaleString('zh-CN')}</div>
            </div>
            <div className="session-actions">
                <button className="btn-icon" title="查看">👁️</button>
                <button className="btn-icon" title="删除" onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑️</button>
            </div>
        </div>
    );
}

export default HomePage;
