import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { idiomLib } from '../idiomLib';
import { PinyinPatch } from '../types';

interface DetailModalProps {
    idiom: string | null;
    onClose: () => void;
    onAddPatch: (idiom: string, originalPinyin: string, correctedPinyin: string) => void;
    onRemovePatch: (idiom: string) => void;
    getPatch: (idiom: string) => PinyinPatch | undefined;
}

function DetailModal({ idiom, onClose, onAddPatch, onRemovePatch, getPatch }: DetailModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const isOpen = idiom !== null;
    const [isEditing, setIsEditing] = useState(false);
    const [editedPinyin, setEditedPinyin] = useState('');

    const item = idiom ? idiomLib['idiomMap'].get(idiom) : null;
    const originalPinyin = item?.pinyin || '';
    const existingPatch = idiom ? getPatch(idiom) : undefined;

    const info = useMemo(() => {
        if (!idiom || !item) return '';
        const pinyin = existingPatch ? existingPatch.correctedPinyin : item.pinyin;
        const patchInfo = existingPatch ? ' (已修正)' : '';
        return `拼音: ${pinyin}${patchInfo}\n出处: ${item.derivation}\n释义: ${item.explanation}\n例子: ${item.example}`;
    }, [idiom, item, existingPatch]);

    useEffect(() => {
        if (idiom) {
            const patch = getPatch(idiom);
            setEditedPinyin(patch ? patch.correctedPinyin : originalPinyin);
            setIsEditing(false);
        }
    }, [idiom, originalPinyin, getPatch]);

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

    const handleStartEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditedPinyin(existingPatch ? existingPatch.correctedPinyin : originalPinyin);
        setIsEditing(false);
    }, [existingPatch, originalPinyin]);

    const handleSaveEdit = useCallback(() => {
        if (!idiom) {
            setIsEditing(false);
            return;
        }

        const trimmedPinyin = editedPinyin.trim();
        if (trimmedPinyin === originalPinyin) {
            onRemovePatch(idiom);
        } else if (trimmedPinyin) {
            onAddPatch(idiom, originalPinyin, trimmedPinyin);
        }
        setIsEditing(false);
    }, [idiom, originalPinyin, editedPinyin, onAddPatch, onRemovePatch]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

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
                {idiom && (
                    <>
                        <div className="modal-header">
                            <h2>{idiom}</h2>
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
                        <div id="modal-body" className="detail-content">{info}</div>

                        <div className="pinyin-edit-section">
                            {isEditing ? (
                                <div className="pinyin-edit-form">
                                    <label className="pinyin-edit-label">修正拼音:</label>
                                    <input
                                        type="text"
                                        className="pinyin-edit-input"
                                        value={editedPinyin}
                                        onChange={(e) => setEditedPinyin(e.target.value)}
                                        placeholder="输入正确的拼音"
                                    />
                                    <div className="pinyin-edit-actions">
                                        <button className="btn btn-secondary" onClick={handleCancelEdit}>
                                            取消
                                        </button>
                                        <button className="btn btn-primary" onClick={handleSaveEdit}>
                                            保存
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button className="btn btn-text pinyin-edit-btn" onClick={handleStartEdit}>
                                    {existingPatch ? '✏️ 修改拼音' : '✏️ 修正拼音'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default DetailModal;
