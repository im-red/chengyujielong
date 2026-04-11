import { useEffect, useCallback, useRef } from 'react';
import { idiomLib } from '../idiomLib';

interface DetailModalProps {
    idiom: string | null;
    onClose: () => void;
}

function DetailModal({ idiom, onClose }: DetailModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const isOpen = idiom !== null;

    const info = idiom ? idiomLib.getExtraInfo(idiom) : '';

    const handleBackdropClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    }, [onClose]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.target === modalRef.current) {
            e.preventDefault();
        }
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.target === modalRef.current) {
            e.preventDefault();
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    useEffect(() => {
        if (!isOpen) {
            const input = document.getElementById('idiom-input') as HTMLInputElement;
            if (input) {
                input.focus();
            }
        }
    }, [isOpen]);

    return (
        <div
            id="detail-modal"
            ref={modalRef}
            className={`modal ${isOpen ? 'show' : ''}`}
            onClick={handleBackdropClick}
            onTouchEnd={handleBackdropClick}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="modal-content">
                <button className="close-modal" onClick={onClose}>&times;</button>
                {idiom && (
                    <>
                        <h2>{idiom}</h2>
                        <div id="modal-body" className="detail-content">{info}</div>
                    </>
                )}
            </div>
        </div>
    );
}

export default DetailModal;
