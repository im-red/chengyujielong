import { useState, useCallback } from 'react';
import { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';
import { generateAvatarColor } from '../utils/generateAvatarColor';
import './PlayerSetupPage.css';

interface PlayerSetupPageProps {
    onStartGame: (players: Player[]) => void;
    onBack: () => void;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

function PlayerSetupPage({ onStartGame, onBack }: PlayerSetupPageProps) {
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
        onStartGame(players);
    };

    const canStartGame = players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS;

    return (
        <div className="player-setup-page">
            <header className="app-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>多人模式</h1>
                </div>
            </header>

            <div className="player-setup-content">
                <div className="player-input-section">
                    <div className="player-input-group">
                        <input
                            type="text"
                            placeholder="输入玩家名称..."
                            value={playerName}
                            onChange={(e) => {
                                setPlayerName(e.target.value);
                                setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            maxLength={20}
                            className="player-name-input"
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleAddPlayer}
                            disabled={players.length >= MAX_PLAYERS}
                        >
                            添加玩家
                        </button>
                    </div>

                    {error && (
                        <div className="player-setup-error">
                            {error}
                        </div>
                    )}

                    <div className="player-count-info">
                        当前玩家: {players.length}/{MAX_PLAYERS}
                        {players.length < MIN_PLAYERS && ` (至少需要${MIN_PLAYERS}人)`}
                    </div>
                </div>

                <div className="player-list">
                    {players.map((player, index) => (
                        <div key={player.id} className="player-list-item">
                            <div className="player-list-item-number">
                                {index + 1}
                            </div>
                            <PlayerAvatar player={player} size="medium" />
                            <div className="player-list-item-name">
                                {player.name}
                            </div>
                            <button
                                className="btn-remove-player"
                                onClick={() => handleRemovePlayer(player.id)}
                                aria-label={`移除 ${player.name}`}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {players.length === 0 && (
                        <div className="player-list-empty">
                            还没有添加玩家，请输入玩家名称并点击"添加玩家"
                        </div>
                    )}
                </div>

                <button
                    className="btn btn-primary btn-start-game"
                    onClick={handleStartGame}
                    disabled={!canStartGame}
                >
                    开始游戏
                </button>
            </div>
        </div>
    );
}

export default PlayerSetupPage;
