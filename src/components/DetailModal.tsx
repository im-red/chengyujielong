import { useEffect, useCallback, useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { idiomLib } from '../util/idiomLib';
import { PinyinPatch } from '../models';
import { highlightText } from '../util/utils';
import './DetailModal.scss';

interface DetailModalProps {
    idiom: string;
    onClose: () => void;
    onAddPatch: (idiom: string, originalPinyin: string, correctedPinyin: string) => void;
    onRemovePatch: (idiom: string) => void;
    getPatch: (idiom: string) => PinyinPatch | undefined;
    searchQuery?: string;
    isFavorite: (idiom: string) => boolean;
    toggleFavorite: (idiom: string) => void;
}

function DetailModal({ idiom, onAddPatch, onRemovePatch, getPatch, searchQuery, isFavorite, toggleFavorite }: DetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPinyin, setEditedPinyin] = useState('');

    const item = idiom ? idiomLib['idiomMap'].get(idiom) : null;
    const originalPinyin = item?.pinyin || '';
    const existingPatch = idiom ? getPatch(idiom) : undefined;

    const pinyin = existingPatch ? existingPatch.correctedPinyin : (item?.pinyin || '');
    const patchInfo = existingPatch ? ' (已修正)' : '';

    useEffect(() => {
        if (idiom) {
            const patch = getPatch(idiom);
            setEditedPinyin(patch ? patch.correctedPinyin : originalPinyin);
            setIsEditing(false);
        }
    }, [idiom, originalPinyin, getPatch]);

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

    if (!idiom) {
        return null;
    }

    return (
        <div>
            <div className="detail-modal-header">
                <h2 className="detail-modal-title">{highlightText(idiom, searchQuery || '', false)}</h2>
                <button
                    type="button"
                    className={`favorite-btn ${isFavorite(idiom) ? 'favorited' : ''}`}
                    onClick={async () => {
                        toggleFavorite(idiom);
                        try {
                            await Haptics.impact({ style: ImpactStyle.Medium });
                        } catch {
                            // Ignore haptics errors on non-mobile platforms
                        }
                    }}
                    title={isFavorite(idiom) ? '取消收藏' : '添加收藏'}
                >
                    {isFavorite(idiom) ? '★' : '☆'}
                </button>
            </div>

            <div id="modal-body" className="detail-modal-body">
                {item && (
                    <>
                        <p><strong>拼音:</strong> {highlightText(pinyin, searchQuery || '', false)}{patchInfo}</p>
                        <p><strong>出处:</strong> {item.derivation ? highlightText(item.derivation, searchQuery || '', false) : '无'}</p>
                        <p><strong>释义:</strong> {item.explanation ? highlightText(item.explanation, searchQuery || '', false) : '无'}</p>
                        <p><strong>例子:</strong> {item.example ? highlightText(item.example, searchQuery || '', false) : '无'}</p>
                    </>
                )}
            </div>

            <div>
                {isEditing ? (
                    <div>
                        <label className="patch-edit-label">修正拼音:</label>
                        <input
                            type="text"
                            value={editedPinyin}
                            onChange={(e) => setEditedPinyin(e.target.value)}
                            placeholder="输入正确的拼音"
                            className="patch-edit-input"
                        />
                        <div className="patch-edit-actions">
                            <button
                                onClick={handleCancelEdit}
                                className="patch-edit-cancel"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="patch-edit-save"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleStartEdit}
                        className="patch-edit-start"
                    >
                        {existingPatch ? '✏️ 修改拼音' : '✏️ 修正拼音'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default DetailModal;
