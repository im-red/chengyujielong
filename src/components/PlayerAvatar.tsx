import { Player } from '../types';
import './PlayerAvatar.css';

interface PlayerAvatarProps {
    player: Player;
    size?: 'small' | 'medium' | 'large';
}

function PlayerAvatar({ player, size = 'medium' }: PlayerAvatarProps) {
    const firstChar = player.name.charAt(0).toUpperCase();
    
    return (
        <div 
            className={`player-avatar player-avatar--${size}`}
            style={{ backgroundColor: player.avatarColor }}
            role="img"
            aria-label={`${player.name}的头像`}
            title={player.name}
        >
            {firstChar}
        </div>
    );
}

export default PlayerAvatar;
