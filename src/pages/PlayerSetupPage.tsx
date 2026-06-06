import React, { useState, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonInput,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../data/AppContext';
import { Player } from '../models';
import PlayerAvatar from '../components/PlayerAvatar';
import { generateAvatarColor } from '../util/generateAvatarColor';
import './PlayerSetupPage.scss';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

const PlayerSetupPage: React.FC = () => {
  const { handleStartMultiplayerGame } = useApp();
  const history = useHistory();
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddPlayer = useCallback(() => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setError('请输入玩家名称');
      return;
    }
    if (players.length >= MAX_PLAYERS) {
      setError(`最多只能添加${MAX_PLAYERS}名玩家`);
      return;
    }
    const newPlayer: Player = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      avatarColor: generateAvatarColor(trimmedName),
      score: 0,
      turnOrder: players.length
    };
    setPlayers([...players, newPlayer]);
    setPlayerName('');
    setError(null);
  }, [playerName, players]);

  const handleRemovePlayer = useCallback((playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId).map((p, index) => ({
      ...p,
      turnOrder: index
    })));
    setError(null);
  }, [players]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  const handleStartGame = () => {
    if (players.length < MIN_PLAYERS) {
      setError(`至少需要${MIN_PLAYERS}名玩家才能开始游戏`);
      return;
    }
    handleStartMultiplayerGame(players);
    history.push('/multiplayer-game');
  };

  const canStartGame = players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS;

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

      <IonContent fullscreen className="ion-padding">
        <div className="setup-section">
          <div className="setup-input-group">
            <IonInput
              placeholder="输入玩家名称..."
              value={playerName}
              onIonInput={(e) => { setPlayerName(e.detail.value ?? ''); setError(null); }}
              onKeyDown={handleKeyDown}
              maxlength={20}
              className="setup-input"
            />
            <IonButton onClick={handleAddPlayer} disabled={players.length >= MAX_PLAYERS}>
              添加玩家
            </IonButton>
          </div>

          {error && (
            <div className="setup-error">
              {error}
            </div>
          )}

          <div className="setup-status">
            当前玩家: {players.length}/{MAX_PLAYERS}
            {players.length < MIN_PLAYERS && ` (至少需要${MIN_PLAYERS}人)`}
          </div>
        </div>

        <div className="setup-player-list">
          {players.map((player, index) => (
            <div key={player.id} className="setup-player-item">
              <div className="setup-player-order">
                {index + 1}
              </div>
              <PlayerAvatar player={player} size="medium" />
              <div className="setup-player-name">{player.name}</div>
              <IonButton
                fill="clear"
                color="danger"
                onClick={() => handleRemovePlayer(player.id)}
                aria-label={`移除 ${player.name}`}
              >
                ×
              </IonButton>
            </div>
          ))}

          {players.length === 0 && (
            <div className="setup-empty">
              还没有添加玩家，请输入玩家名称并点击"添加玩家"
            </div>
          )}
        </div>

        <IonButton
          expand="block"
          size="large"
          onClick={handleStartGame}
          disabled={!canStartGame}
        >
          开始游戏
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PlayerSetupPage;
