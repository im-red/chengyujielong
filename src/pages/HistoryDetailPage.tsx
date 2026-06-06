import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useApp } from '../data/AppContext';
import { GameMode } from '../models';
import MessageBubble from '../components/MessageBubble';
import ScoreBoard from '../components/ScoreBoard';
import './HistoryDetailPage.scss';

const HistoryDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { gameState, setDetailModalIdiom, setCandidatesModalIdiom } = useApp();

  const session = gameState.sessions.find(s => s.id === sessionId);

  if (!session) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/" />
            </IonButtons>
            <IonTitle>记录不存在</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>未找到该游戏记录</p>
        </IonContent>
      </IonPage>
    );
  }

  const modeNames: Record<string, string> = {
    [GameMode.Endless]: '无尽模式',
    [GameMode.LimitedTime]: '限时模式',
    [GameMode.Multiplayer]: '多人模式'
  };

  let modeDisplay = modeNames[session.mode];

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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>{modeDisplay}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="history-detail-stats">
          {session.mode !== GameMode.Multiplayer && (
            <div>
              <div className="history-stat-label">得分</div>
              <div className="history-stat-value">{session.score}</div>
            </div>
          )}
          <div>
            <div className="history-stat-label">回合</div>
            <div className="history-stat-value">{session.messages.length}</div>
          </div>
          <div>
            <div className="history-stat-label">时长</div>
            <div className="history-stat-value">{formatDuration(duration)}</div>
          </div>
          <div>
            <div className="history-stat-label">日期</div>
            <div className="history-stat-date">{date.toLocaleDateString('zh-CN')}</div>
          </div>
        </div>

        {session.mode === GameMode.Multiplayer && session.players && (
          <div className="history-scoreboard">
            <ScoreBoard players={session.players} compact={true} />
          </div>
        )}

        <div className="history-messages">
          {session.messages.map((msg, index) => {
            const player = session.players?.find(p => p.id === msg.playerId);
            return (
              <MessageBubble
                key={`${msg.timestamp}-${index}`}
                message={msg}
                isFirst={index === 0}
                mode={session.mode}
                onShowDetail={(idiom) => setDetailModalIdiom(idiom)}
                onShowCandidates={(idiom) => setCandidatesModalIdiom(idiom)}
                player={player}
              />
            );
          })}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HistoryDetailPage;
