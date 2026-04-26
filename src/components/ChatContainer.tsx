import { useRef, useEffect, RefObject } from 'react';
import { GameMessage, GameMode, Player } from '../types';
import MessageBubble from './MessageBubble';

interface ChatContainerProps {
    messages: GameMessage[];
    mode: GameMode;
    onShowDetail: (idiom: string) => void;
    onShowCandidates: (idiom: string) => void;
    containerRef?: RefObject<HTMLDivElement>;
    players?: Player[];
}

function ChatContainer({
    messages,
    mode,
    onShowDetail,
    onShowCandidates,
    containerRef,
    players
}: ChatContainerProps) {
    const defaultRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = containerRef || defaultRef;

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages.length, chatContainerRef]);

    const getPlayerById = (playerId?: string): Player | undefined => {
        if (!playerId || !players) return undefined;
        return players.find(p => p.id === playerId);
    };

    return (
        <div className="chat-container" ref={chatContainerRef}>
            {messages.map((msg, index) => (
                <MessageBubble
                    key={`${msg.timestamp}-${index}`}
                    message={msg}
                    isFirst={index === 0}
                    mode={mode}
                    onShowDetail={onShowDetail}
                    onShowCandidates={onShowCandidates}
                    player={getPlayerById(msg.playerId)}
                />
            ))}
        </div>
    );
}

export default ChatContainer;
