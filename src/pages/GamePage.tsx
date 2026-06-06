import { useState, useEffect, useRef, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonFooter,
  IonModal,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../data/AppContext';
import { GameMode } from '../models';
import ChatContainer from '../components/ChatContainer';
import IdiomInput from '../components/IdiomInput';
import GameOverModal from '../components/GameOverModal';
import { useIdiomSubmission } from '../hooks/useIdiomSubmission';
import './GamePage.scss';

const GamePage: React.FC = () => {
  const {
    gameState, gameActions,
    setDetailModalIdiom, setCandidatesModalIdiom,
  } = useApp();
  const history = useHistory();
  const session = gameState.currentSession;

  const [input, setInput] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  const { isSubmitting, submitIdiom } = useIdiomSubmission({
    onSubmitIdiom: gameActions.submitIdiom,
    onTriggerComputerTurn: gameActions.triggerComputerTurn
  });

  useEffect(() => {
    if (!session) {
      history.replace('/');
      return;
    }
  }, [session, history]);

  if (!session) {
    return null;
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

  useEffect(() => {
    if (session.isActive) {
      const interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - gameState.currentTurnStartTime) / 100) / 10);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [session.isActive, gameState.currentTurnStartTime]);

  const wasActiveRef = useRef(session.isActive);
  useEffect(() => {
    if (wasActiveRef.current && !session.isActive) {
      setDetailModalIdiom(null);
      setCandidatesModalIdiom(null);
      setIsGameOverModalOpen(true);
    }
    wasActiveRef.current = session.isActive;
  }, [session.isActive, setDetailModalIdiom, setCandidatesModalIdiom]);

  const handleSubmit = useCallback(async () => {
    await submitIdiom(input);
    setInput('');
  }, [input, submitIdiom]);

  const handleGiveUp = useCallback(() => {
    gameActions.giveUp();
  }, [gameActions]);

  const timerDisplay = `${currentTime.toFixed(1)}s`;

  const isTimerWarning = false;

  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const isGameTimeWarning = session.mode === GameMode.LimitedTime && gameState.gameRemainingTime <= 30;

  const handleGameOverClose = () => {
    setIsGameOverModalOpen(false);
    if (session) {
      history.replace(`/history/${session.id}`);
    }
  };

  const handleGameOverGoHome = () => {
    setIsGameOverModalOpen(false);
    history.replace('/');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>{modeDisplay}</IonTitle>
        </IonToolbar>
        {session.isActive && (
          <div className="game-status-bar">
            <span id="score-display" className="game-status-left">得分: {session.score}</span>
            {session.mode === GameMode.LimitedTime && (
              <span
                id="game-time-display"
                className={`game-status-center ${isGameTimeWarning ? "game-time-warning" : "game-time-normal"}`}
              >
                {formatGameTime(gameState.gameRemainingTime)}
              </span>
            )}
            <span
              id={'current-time-display'}
              className={`game-status-right ${isTimerWarning ? "game-time-warning" : "game-time-normal"}`}
            >
              {timerDisplay}
            </span>
          </div>
        )}
      </IonHeader>

      <IonContent fullscreen className="game-page-content">
        <div className="chat-container-wrapper">
          <ChatContainer
            messages={session.messages}
            mode={session.mode}
            onShowDetail={(idiom) => setDetailModalIdiom(idiom)}
            onShowCandidates={(idiom) => setCandidatesModalIdiom(idiom)}
          />
        </div>

        <IonModal isOpen={isGameOverModalOpen} onDidDismiss={() => setIsGameOverModalOpen(false)}>
          <IonContent className="ion-padding" scrollY={false}>
            <GameOverModal
              isOpen={isGameOverModalOpen}
              score={session.score ?? 0}
              mode={session.mode}
              onClose={handleGameOverClose}
              onGoHome={handleGameOverGoHome}
            />
          </IonContent>
        </IonModal>
      </IonContent>

      {session.isActive && (
        <IonFooter>
          <IdiomInput
            input={input}
            isSubmitting={isSubmitting}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onGiveUp={handleGiveUp}
            showGiveUp={session.mode === GameMode.Endless || session.mode === GameMode.LimitedTime}
          />
        </IonFooter>
      )}
    </IonPage>
  );
};

export default GamePage;
