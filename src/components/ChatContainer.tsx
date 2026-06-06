import { useRef, useEffect, RefObject } from 'react';
import { GameMessage, GameMode, Player } from '../models';
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
        const scrollToBottom = () => {
            if (chatContainerRef.current) {
                // If it's a regular div, just scroll it
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;

                // If this is wrapped in IonContent, we might need to scroll the inner scrollable element
                // But typically Ionic handles this via its own methods, or we can find the inner element
                const ionContent = chatContainerRef.current.closest('ion-content');
                if (ionContent) {
                    const innerScroll = ionContent.shadowRoot?.querySelector('.inner-scroll') as HTMLElement;
                    if (innerScroll) {
                        innerScroll.scrollTop = innerScroll.scrollHeight;
                    } else {
                        // Ionic 7+ might use different internal structure, fallback to using scrollToBottom if available
                        (ionContent as any).scrollToBottom?.(300);
                    }
                }
            }
        };

        // Call immediately
        scrollToBottom();

        // Also call after a short delay to ensure DOM has updated
        const timerId = setTimeout(scrollToBottom, 50);

        return () => clearTimeout(timerId);
    }, [messages, chatContainerRef]);

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
