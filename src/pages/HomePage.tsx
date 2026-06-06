import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonAlert,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../data/AppContext';
import { GameMode, GameSession } from '../models';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const {
    gameState, gameActions, handleStartGame
  } = useApp();
  const history = useHistory();
  const { sessions } = gameState;
  const [confirmDeleteType, setConfirmDeleteType] = useState<'single' | 'all' | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleSelectEndlessMode = () => {
    handleStartGame(GameMode.Endless);
    history.push('/game');
  };

  const handleSelectLimitedTimeMode = () => {
    history.push('/limited-time-config');
  };

  const handleSelectMultiplayerMode = () => {
    history.push('/player-setup');
  };

  const handleViewSession = (sessionId: string) => {
    history.push(`/history/${sessionId}`);
  };

  const handleClearHistory = () => {
    setConfirmDeleteType('all');
  };

  const handleDeleteSession = (sessionId: string) => {
    setDeleteTargetId(sessionId);
    setConfirmDeleteType('single');
  };

  const confirmAction = () => {
    if (confirmDeleteType === 'all') {
      gameActions.clearAllSessions();
    } else if (confirmDeleteType === 'single' && deleteTargetId) {
      gameActions.deleteSession(deleteTargetId);
    }
    setConfirmDeleteType(null);
    setDeleteTargetId(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton menu="side-menu" />
          </IonButtons>
          <IonTitle>成语接龙</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">成语接龙</IonTitle>
          </IonToolbar>
        </IonHeader>

        <p className="home-subtitle">
          选择游戏模式开始新游戏
        </p>

        <div className="mode-list">
          <div
            onClick={handleSelectEndlessMode}
            className="mode-card mode-card-endless"
          >
            <div className="mode-card-icon">♾️</div>
            <h3 className="mode-card-title">无尽模式</h3>
            <p className="mode-card-desc">可放弃，永不结束</p>
          </div>

          <div
            onClick={handleSelectLimitedTimeMode}
            className="mode-card mode-card-limited"
          >
            <div className="mode-card-icon">⏱️</div>
            <h3 className="mode-card-title">限时模式</h3>
            <p className="mode-card-desc">限时挑战，争分夺秒</p>
          </div>

          <div
            onClick={handleSelectMultiplayerMode}
            className="mode-card mode-card-multiplayer"
          >
            <div className="mode-card-icon">👥</div>
            <h3 className="mode-card-title">多人模式</h3>
            <p className="mode-card-desc">好友同屏，轮流接龙</p>
          </div>
        </div>

        <div>
          <div className="history-header">
            <h2 className="history-title">历史记录</h2>
            {sessions.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="btn-clear-history"
              >
                清空
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="history-empty">
              <p>暂无游戏记录</p>
            </div>
          ) : (
            <div>
              {[...sessions].sort((a, b) => b.startTime - a.startTime).map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={() => handleDeleteSession(session.id)}
                  onView={() => handleViewSession(session.id)}
                />
              ))}
            </div>
          )}
        </div>

        <IonAlert
          isOpen={confirmDeleteType !== null}
          onDidDismiss={() => { setConfirmDeleteType(null); setDeleteTargetId(null); }}
          header={confirmDeleteType === 'all' ? '清空所有历史记录' : '删除记录'}
          message={confirmDeleteType === 'all' ? '确定要清空所有历史记录吗？' : '确定要删除这条记录吗？'}
          buttons={[
            { text: '取消', role: 'cancel' },
            { text: '确定', role: 'destructive', handler: confirmAction }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

function SessionCard({ session, onDelete, onView }: {
  session: GameSession;
  onDelete: () => void;
  onView: () => void;
}) {
  const duration = session.endTime
    ? Math.floor((session.endTime - session.startTime) / 1000)
    : 0;
  const date = new Date(session.startTime);
  const modeNames: Record<string, string> = {
    [GameMode.Endless]: '无尽',
    [GameMode.LimitedTime]: '限时',
    [GameMode.Multiplayer]: '多人'
  };

  let configStr = '';

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
    <div
      onClick={onView}
      className="session-card"
    >
      <div>
        <div className="session-card-title">
          {modeNames[session.mode]}{configStr}
        </div>
        <div className="session-card-stats">
          <span>得分: {session.score}</span>
          <span className="session-card-stats-item">回合: {session.messages.length}</span>
          {duration > 0 && <span>时长: {duration}s</span>}
        </div>
        <div className="session-card-date">
          {date.toLocaleString('zh-CN')}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="btn-delete-session"
        title="删除"
      >
        🗑️
      </button>
    </div>
  );
}

export default HomePage;
