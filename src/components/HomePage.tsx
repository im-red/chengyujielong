import { useEffect, useRef, useState } from 'react';
import { App } from '@capacitor/app';
import { GameSession, GameMode } from '../types';

interface HomePageProps {
    sessions: GameSession[];
    onSelectEndlessMode: () => void;
    onSelectChallengeMode: () => void;
    onSelectLimitedTimeMode: () => void;
    onDeleteSession: (sessionId: string) => void;
    onClearAllSessions: () => void;
    onViewSession: (sessionId: string) => void;
    patchesCount: number;
    onViewPinyinPatches: () => void;
    onViewIdiomLibrary: () => void;
    onViewTrend: () => void;
    onViewFavorites: () => void;
    favoritesCount: number;
    isSideMenuOpen: boolean;
    setIsSideMenuOpen: (open: boolean) => void;
    onExportData: () => void;
    onImportData: () => void;
}

function HomePage({
    sessions,
    onSelectEndlessMode,
    onSelectChallengeMode,
    onSelectLimitedTimeMode,
    onDeleteSession,
    onClearAllSessions,
    onViewSession,
    patchesCount,
    onViewPinyinPatches,
    onViewIdiomLibrary,
    onViewTrend,
    onViewFavorites,
    favoritesCount,
    isSideMenuOpen,
    setIsSideMenuOpen,
    onExportData,
    onImportData
}: HomePageProps) {
    const sideMenuRef = useRef<HTMLDivElement>(null);
    const [versionString, setVersionString] = useState('v99.99.99-b99');

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const info = await App.getInfo();
                const version = info.version || '99.99.99';
                const build = info.build || '99';
                setVersionString(`v${version}-b${build}`);
            } catch {
                setVersionString('v99.99.99-b99');
            }
        };
        fetchVersion();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sideMenuRef.current && !sideMenuRef.current.contains(event.target as Node)) {
                setIsSideMenuOpen(false);
            }
        };
        if (isSideMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSideMenuOpen]);

    useEffect(() => {
        if (!isSideMenuOpen || !sideMenuRef.current) return;

        const sideMenu = sideMenuRef.current;
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        const handleTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            if (diff < 0) {
                const menuWidth = sideMenu.offsetWidth;
                const translateX = Math.max(diff, -menuWidth);
                sideMenu.style.transform = `translateX(${translateX}px)`;
                sideMenu.style.transition = 'none';
            }
        };

        const handleTouchEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            const diff = currentX - startX;
            const menuWidth = sideMenu.offsetWidth;
            sideMenu.style.transition = '';
            sideMenu.style.transform = '';
            if (diff < -menuWidth * 0.3) {
                setIsSideMenuOpen(false);
            }
        };

        sideMenu.addEventListener('touchstart', handleTouchStart, { passive: true });
        sideMenu.addEventListener('touchmove', handleTouchMove, { passive: true });
        sideMenu.addEventListener('touchend', handleTouchEnd);

        return () => {
            sideMenu.removeEventListener('touchstart', handleTouchStart);
            sideMenu.removeEventListener('touchmove', handleTouchMove);
            sideMenu.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isSideMenuOpen]);

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

    const handleViewPinyinPatches = () => {
        setIsSideMenuOpen(false);
        onViewPinyinPatches();
    };

    const handleViewIdiomLibrary = () => {
        setIsSideMenuOpen(false);
        onViewIdiomLibrary();
    };

    const handleViewTrend = () => {
        setIsSideMenuOpen(false);
        onViewTrend();
    };

    const handleViewFavorites = () => {
        setIsSideMenuOpen(false);
        onViewFavorites();
    };

    return (
        <div className="home-container">
            {isSideMenuOpen && <div className="side-menu-backdrop" onClick={() => setIsSideMenuOpen(false)} />}
            <div ref={sideMenuRef} className={`side-menu ${isSideMenuOpen ? 'side-menu--open' : ''}`}>
                <div className="side-menu-header">
                    <h2>菜单</h2>
                    <button
                        className="side-menu-close"
                        onClick={() => setIsSideMenuOpen(false)}
                    >
                        ×
                    </button>
                </div>
                <div className="side-menu-content">
                    <button className="side-menu-item" onClick={handleViewFavorites}>
                        <span className="side-menu-icon">⭐</span>
                        <span>收藏夹</span>
                        {favoritesCount > 0 && <span className="side-menu-badge">{favoritesCount}</span>}
                    </button>
                    <button className="side-menu-item" onClick={handleViewTrend}>
                        <span className="side-menu-icon">📈</span>
                        <span>成绩趋势</span>
                    </button>
                    <button className="side-menu-item" onClick={handleViewIdiomLibrary}>
                        <span className="side-menu-icon">📚</span>
                        <span>成语词典</span>
                    </button>
                    <button className="side-menu-item" onClick={handleViewPinyinPatches}>
                        <span className="side-menu-icon">📝</span>
                        <span>拼音修正</span>
                        {patchesCount > 0 && <span className="side-menu-badge">{patchesCount}</span>}
                    </button>
                    <button className="side-menu-item" onClick={() => { setIsSideMenuOpen(false); onExportData(); }}>
                        <span className="side-menu-icon">📤</span>
                        <span>导出数据</span>
                    </button>
                    <button className="side-menu-item" onClick={() => { setIsSideMenuOpen(false); onImportData(); }}>
                        <span className="side-menu-icon">📥</span>
                        <span>导入数据</span>
                    </button>
                </div>
                <div className="side-menu-footer">
                    {versionString}
                </div>
            </div>

            <header className="app-header">
                <button
                    className="btn-menu"
                    onClick={() => setIsSideMenuOpen(true)}
                    aria-label="打开菜单"
                >
                    ☰
                </button>
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

                    <div className="mode-card" data-mode={GameMode.LimitedTime} onClick={onSelectLimitedTimeMode}>
                        <div className="mode-icon">⏱️</div>
                        <h3>限时模式</h3>
                        <p>限时挑战，争分夺秒</p>
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
                                    onView={() => onViewSession(session.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SessionCard({ session, onDelete, onView }: { session: GameSession; onDelete: () => void; onView: () => void }) {
    const duration = session.endTime
        ? Math.floor((session.endTime - session.startTime) / 1000)
        : 0;
    const date = new Date(session.startTime);
    const modeNames = {
        [GameMode.Endless]: '无尽',
        [GameMode.Challenge]: '挑战',
        [GameMode.LimitedTime]: '限时'
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

    if (session.mode === GameMode.LimitedTime && session.limitedTimeConfig) {
        const mins = Math.floor(session.limitedTimeConfig.gameTimeLimit / 60);
        const secs = session.limitedTimeConfig.gameTimeLimit % 60;
        if (mins > 0 && secs > 0) {
            configStr = ` (${mins}分${secs}秒)`;
        } else if (mins > 0) {
            configStr = ` (${mins}分钟)`;
        } else {
            configStr = ` (${secs}秒)`;
        }
    }

    return (
        <div className="session-card" onClick={onView}>
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
                <button className="btn-icon" title="删除" onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑️</button>
            </div>
        </div>
    );
}

export default HomePage;
