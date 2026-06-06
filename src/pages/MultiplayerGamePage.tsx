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
import ChatContainer from '../components/ChatContainer';
import IdiomInput from '../components/IdiomInput';
import ScoreBoard from '../components/ScoreBoard';
import PlayerAvatar from '../components/PlayerAvatar';
import { useIdiomSubmission } from '../hooks/useIdiomSubmission';
import './MultiplayerGamePage.scss';

const MultiplayerGamePage: React.FC = () => {
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
  });

  useEffect(() => {
    if (!session || session.mode !== 'multiplayer') {
      history.replace('/');
      return;
    }
  }, [session, history]);

  if (!session || session.mode !== 'multiplayer') {
    return null;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor((Date.now() - gameState.currentTurnStartTime) / 100) / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [gameState.currentTurnStartTime]);

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
    setInput('');
  }, [gameActions]);

  const currentPlayer = gameActions.getCurrentPlayer();
  const players = session.players || [];

  const handleGameOverGoHome = useCallback(() => {
    setIsGameOverModalOpen(false);
    history.push('/home');
  }, [history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>多人模式</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="multiplayer-content">
        {session.isActive && currentPlayer && (
          <ScoreBoard
            players={players}
            currentPlayerId={currentPlayer.id}
            compact={false}
          />
        )}

        {session.isActive && currentPlayer && (
          <div className="multiplayer-turn-banner">
            <PlayerAvatar player={currentPlayer} size="small" />
            <span className="multiplayer-turn-name">{currentPlayer.name} 的回合</span>
            <span className="multiplayer-turn-time">{currentTime.toFixed(1)}s</span>
          </div>
        )}

        <div className="multiplayer-chat-wrapper">
          <ChatContainer
            messages={session.messages}
            mode={session.mode}
            onShowDetail={(idiom) => setDetailModalIdiom(idiom)}
            onShowCandidates={(idiom) => setCandidatesModalIdiom(idiom)}
            players={players}
          />
        </div>

        {session.isActive && session.messages.length === 0 && currentPlayer && (
          <div className="multiplayer-start-banner">
            <PlayerAvatar player={currentPlayer} size="medium" />
            <div>
              <strong>{currentPlayer.name}</strong> 先手
              <div className="multiplayer-start-hint">
                请输入任意成语开始游戏
              </div>
            </div>
          </div>
        )}

        <IonModal isOpen={isGameOverModalOpen} onDidDismiss={() => setIsGameOverModalOpen(false)}>
          <IonContent className="ion-padding">
            <div className="multiplayer-game-over-container">
              <h2>游戏结束</h2>
              <ScoreBoard
                players={players}
                compact={false}
              />
              <button
                onClick={handleGameOverGoHome}
                className="multiplayer-btn-home"
              >
                返回主页
              </button>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>

      {session.isActive && currentPlayer && (
        <IonFooter>
          <div className="multiplayer-input-header">
            <div className="multiplayer-input-player">
              <PlayerAvatar player={currentPlayer} size="small" />
              <span className="multiplayer-input-player-name">{currentPlayer.name}</span>
            </div>
          </div>
          <IdiomInput
            input={input}
            isSubmitting={isSubmitting}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onGiveUp={handleGiveUp}
            showGiveUp={true}
          />
        </IonFooter>
      )}
    </IonPage>
  );
};

export default MultiplayerGamePage;
