import { GameSession, GameMode } from '../types';
import MessageBubble from './MessageBubble';

interface HistoryDetailPageProps {
    session: GameSession;
    onBack: () => void;
    onShowDetail: (idiom: string) => void;
    onShowCandidates: (idiom: string) => void;
}

function HistoryDetailPage({
    session,
    onBack,
    onShowDetail,
    onShowCandidates
}: HistoryDetailPageProps) {
    const modeNames = {
        [GameMode.Endless]: '无尽模式',
        [GameMode.Challenge]: '挑战模式',
        [GameMode.LimitedTime]: '限时模式'
    };

    let modeDisplay = modeNames[session.mode];
    if (session.mode === GameMode.Challenge && session.challengeConfig) {
        const parts = [];
        if (session.challengeConfig.lives > 0) {
            parts.push(`${session.challengeConfig.lives}命`);
        } else {
            parts.push('经典');
        }
        if (session.challengeConfig.timeLimit > 0) {
            parts.push(`${session.challengeConfig.timeLimit}秒`);
        }
        if (parts.length > 0) {
            modeDisplay += ` (${parts.join(', ')})`;
        }
    }

    if (session.mode === GameMode.LimitedTime && session.limitedTimeConfig) {
        const mins = Math.floor(session.limitedTimeConfig.gameTimeLimit / 60);
        const secs = session.limitedTimeConfig.gameTimeLimit % 60;
        if (mins > 0 && secs > 0) {
            modeDisplay += ` (${mins}分${secs}秒)`;
        } else if (mins > 0) {
            modeDisplay += ` (${mins}分钟)`;
        } else {
            modeDisplay += ` (${secs}秒)`;
        }
    }

    const duration = session.endTime
        ? Math.floor((session.endTime - session.startTime) / 1000)
        : session.messages.length > 0
            ? Math.floor((session.messages[session.messages.length - 1].timestamp - session.startTime) / 1000)
            : 0;

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds}秒`;
        }
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
    };

    const date = new Date(session.startTime);

    return (
        <div className="game-container history-detail-container">
            <header className="game-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>{modeDisplay}</h1>
                </div>
            </header>

            <div className="history-detail-summary">
                <div className="summary-item">
                    <span className="summary-label">得分</span>
                    <span className="summary-value">{session.score}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">回合</span>
                    <span className="summary-value">{session.messages.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">时长</span>
                    <span className="summary-value">{formatDuration(duration)}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">日期</span>
                    <span className="summary-value summary-date">{date.toLocaleDateString('zh-CN')}</span>
                </div>
            </div>

            <div className="chat-container">
                {session.messages.map((msg, index) => (
                    <MessageBubble
                        key={`${msg.timestamp}-${index}`}
                        message={msg}
                        isFirst={index === 0}
                        mode={session.mode}
                        onShowDetail={onShowDetail}
                        onShowCandidates={onShowCandidates}
                    />
                ))}
            </div>
        </div>
    );
}

export default HistoryDetailPage;
