import { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';
import './ScoreBoard.css';

interface ScoreBoardProps {
    players: Player[];
    currentPlayerId?: string;
    compact?: boolean;
}

function ScoreBoard({ players, currentPlayerId, compact = false }: ScoreBoardProps) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className={`scoreboard ${compact ? 'scoreboard--compact' : ''}`}>
            {sortedPlayers.map((player, index) => {
                const isCurrentPlayer = player.id === currentPlayerId;
                
                return (
                    <div 
                        key={player.id}
                        className={`scoreboard-item ${isCurrentPlayer ? 'scoreboard-item--active' : ''}`}
                    >
                        <div className="scoreboard-rank">
                            {index + 1}
                        </div>
                        <PlayerAvatar 
                            player={player} 
                            size={compact ? 'small' : 'medium'}
                        />
                        <div className="scoreboard-info">
                            <div className="scoreboard-name">{player.name}</div>
                            <div className="scoreboard-score">{player.score}分</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ScoreBoard;
