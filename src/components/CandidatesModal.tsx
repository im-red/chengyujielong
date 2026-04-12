import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { idiomLib } from '../idiomLib';

interface CandidatesModalProps {
    idiom: string | null;
    onClose: () => void;
    onShowDetail: (idiom: string) => void;
}

function CandidatesModal({ idiom, onClose, onShowDetail }: CandidatesModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const isOpen = idiom !== null;

    const { allCandidates, usedCandidates, unusedCandidates } = useMemo(() => {
        if (!idiom) {
            return { allCandidates: [], usedCandidates: [], unusedCandidates: [] };
        }
        const all = idiomLib.getCandidateList(idiom);
        const unused = idiomLib.getUnusedCandidateList(idiom);
        const used = all.filter(c => !unused.includes(c));
        return { allCandidates: all, usedCandidates: used, unusedCandidates: unused };
    }, [idiom]);

    const handleBackdropClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (e.target === modalRef.current) {
            e.preventDefault();
            const input = document.getElementById('idiom-input') as HTMLInputElement;
            if (input) input.focus();
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
            setSelectedType(null);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    const handleStatClick = (type: string) => {
        setSelectedType(type);
    };

    const handleCandidateClick = (candidateIdiom: string) => {
        const input = document.getElementById('idiom-input') as HTMLInputElement;
        if (input) input.focus();
        onShowDetail(candidateIdiom);
    };

    const getCandidatesForType = () => {
        switch (selectedType) {
            case 'total':
                return { title: '全部候选成语', candidates: allCandidates };
            case 'used':
                return { title: '已使用的候选成语', candidates: usedCandidates };
            case 'unused':
                return { title: '未使用的候选成语', candidates: unusedCandidates };
            default:
                return { title: '', candidates: [] };
        }
    };

    const { title, candidates } = getCandidatesForType();

    return (
        <div
            id="candidates-modal"
            ref={modalRef}
            className={`modal ${isOpen ? 'show' : ''}`}
            onClick={handleBackdropClick}
            onTouchEnd={handleBackdropClick}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="modal-content">
                {idiom && (
                    <>
                        <div className="modal-header">
                            <h2>候选成语统计</h2>
                            <button
                                type="button"
                                className="close-modal"
                                onClick={() => {
                                    const input = document.getElementById('idiom-input') as HTMLInputElement;
                                    if (input) input.focus();
                                    onClose();
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                onTouchStart={(e) => e.preventDefault()}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    const input = document.getElementById('idiom-input') as HTMLInputElement;
                                    if (input) input.focus();
                                    onClose();
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="candidates-stats">
                            <div
                                className="stat-item clickable"
                                data-type="total"
                                onMouseDown={(e) => e.preventDefault()}
                                onTouchStart={(e) => e.preventDefault()}
                                onClick={() => handleStatClick('total')}
                            >
                                <span className="stat-label">总数</span>
                                <span className="stat-value">{allCandidates.length}</span>
                                <span className="stat-hint">点击查看</span>
                            </div>
                            <div
                                className="stat-item clickable"
                                data-type="used"
                                onMouseDown={(e) => e.preventDefault()}
                                onTouchStart={(e) => e.preventDefault()}
                                onClick={() => handleStatClick('used')}
                            >
                                <span className="stat-label">已使用</span>
                                <span className="stat-value used">{usedCandidates.length}</span>
                                <span className="stat-hint">点击查看</span>
                            </div>
                            <div
                                className="stat-item clickable"
                                data-type="unused"
                                onMouseDown={(e) => e.preventDefault()}
                                onTouchStart={(e) => e.preventDefault()}
                                onClick={() => handleStatClick('unused')}
                            >
                                <span className="stat-label">未使用</span>
                                <span className="stat-value unused">{unusedCandidates.length}</span>
                                <span className="stat-hint">点击查看</span>
                            </div>
                        </div>

                        {selectedType && (
                            <div className="candidates-detail">
                                <div className="candidates-section">
                                    <h3>{title} <span className="tap-hint">(点击查看详情)</span></h3>
                                    <div className="candidates-list">
                                        {candidates.length > 0 ? (
                                            candidates.map(c => {
                                                const isThisUsed = usedCandidates.includes(c);
                                                return (
                                                    <div
                                                        key={c}
                                                        className={`candidate-item ${isThisUsed ? 'used-item' : ''}`}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => handleCandidateClick(c)}
                                                    >
                                                        {c}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="empty-message">没有候选成语</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default CandidatesModal;
