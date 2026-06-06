import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../data/AppContext';
import { GameMode, LimitedTimeConfig } from '../models';
import './LimitedTimeConfigPage.scss';

const LimitedTimeConfigPage: React.FC = () => {
  const { handleStartGame } = useApp();
  const history = useHistory();
  const [gameTimeLimit, setGameTimeLimit] = useState(120);

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

  const handleStart = () => {
    handleStartGame(GameMode.LimitedTime, { gameTimeLimit } as LimitedTimeConfig);
    history.replace('/game');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>限时模式配置</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <p className="config-subtitle">
          设置游戏总时长
        </p>

        <div className="config-section">
          <label className="config-label">
            <span className="config-label-title">游戏时长</span>
            <span className="config-label-desc">
              时间结束后游戏结束
            </span>
          </label>
          <div className="config-input-group">
            <IonButton fill="outline" size="small" onClick={() => setGameTimeLimit(Math.max(30, gameTimeLimit - 30))}>-</IonButton>
            <input
              id="game-time-input"
              type="text"
              readOnly
              className="config-input"
              value={formatTime(gameTimeLimit)}
            />
            <IonButton fill="outline" size="small" onClick={() => setGameTimeLimit(Math.min(600, gameTimeLimit + 30))}>+</IonButton>
          </div>
          <div className="config-presets">
            <IonButton size="small" fill="clear" onClick={() => setGameTimeLimit(60)}>1分钟</IonButton>
            <IonButton size="small" fill="clear" onClick={() => setGameTimeLimit(120)}>2分钟</IonButton>
            <IonButton size="small" fill="clear" onClick={() => setGameTimeLimit(180)}>3分钟</IonButton>
            <IonButton size="small" fill="clear" onClick={() => setGameTimeLimit(300)}>5分钟</IonButton>
          </div>
        </div>

        <IonButton id="start-limited-time-btn" expand="block" size="large" onClick={handleStart}>
          开始游戏
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LimitedTimeConfigPage;
