import { useState, useMemo, useEffect } from 'react';
import { idiomLib } from '../util/idiomLib';
import './CandidatesModal.scss';

interface CandidatesModalProps {
    idiom: string;
    onClose: () => void;
    onShowDetail: (idiom: string) => void;
    isFavorite: (idiom: string) => boolean;
    toggleFavorite: (idiom: string) => void;
}

function CandidatesModal({ idiom, onShowDetail, isFavorite }: CandidatesModalProps) {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [snapshotFavorites, setSnapshotFavorites] = useState<string[]>([]);

    const { allCandidates, usedCandidates, unusedCandidates } = useMemo(() => {
        if (!idiom) {
            return { allCandidates: [], usedCandidates: [], unusedCandidates: [] };
        }
        const all = idiomLib.getCandidateList(idiom);
        const unused = idiomLib.getUnusedCandidateList(idiom);
        const used = all.filter(c => !unused.includes(c));
        return { allCandidates: all, usedCandidates: used, unusedCandidates: unused };
    }, [idiom]);

    useEffect(() => {
        setSelectedType(null);
    }, [idiom]);

    const handleStatClick = (type: string) => {
        if (type === 'favorites') {
            setSnapshotFavorites(allCandidates.filter(c => isFavorite(c)));
        }
        setSelectedType(type);
    };

    const handleCandidateClick = (candidateIdiom: string) => {
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
            case 'favorites':
                return { title: '已收藏的候选成语', candidates: snapshotFavorites };
            default:
                return { title: '', candidates: [] };
        }
    };

    const { title, candidates } = getCandidatesForType();
    const currentFavoriteCount = allCandidates.filter(c => isFavorite(c)).length;

    return (
        <div>
            <h2 className="candidates-modal-title">候选成语统计</h2>
            <div className="candidates-stat-grid">
                <div
                    onClick={() => handleStatClick('total')}
                    className={`candidates-stat-card ${selectedType === 'total' ? 'candidates-stat-card-active' : 'candidates-stat-card-inactive'}`}
                >
                    <div className="candidates-stat-count">{allCandidates.length}</div>
                    <div className="candidates-stat-label">全部</div>
                </div>
                <div
                    onClick={() => handleStatClick('used')}
                    className={`candidates-stat-card ${selectedType === 'used' ? 'candidates-stat-card-active' : 'candidates-stat-card-inactive'}`}
                >
                    <div className="candidates-stat-count">{usedCandidates.length}</div>
                    <div className="candidates-stat-label">已使用</div>
                </div>
                <div
                    onClick={() => handleStatClick('unused')}
                    className={`candidates-stat-card ${selectedType === 'unused' ? 'candidates-stat-card-active' : 'candidates-stat-card-inactive'}`}
                >
                    <div className="candidates-stat-count">{unusedCandidates.length}</div>
                    <div className="candidates-stat-label">未使用</div>
                </div>
                <div
                    onClick={() => handleStatClick('favorites')}
                    className={`candidates-stat-card ${selectedType === 'favorites' ? 'candidates-stat-card-active' : 'candidates-stat-card-inactive'}`}
                >
                    <div className="candidates-stat-count">{currentFavoriteCount}</div>
                    <div className="candidates-stat-label">已收藏</div>
                </div>
            </div>

            {selectedType && candidates.length > 0 && (
                <div>
                    <h3 className="candidates-list-title">{title}</h3>
                    <div className="candidates-list-container">
                        {candidates.map(c => (
                            <div
                                key={c}
                                onClick={() => handleCandidateClick(c)}
                                className={`candidate-item ${isFavorite(c) ? 'candidate-item-favorite' : 'candidate-item-normal'}`}
                            >
                                {c}
                                {isFavorite(c) && <span className="candidate-star">★</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedType && candidates.length === 0 && (
                <div className="candidates-empty">
                    暂无
                </div>
            )}
        </div>
    );
}

export default CandidatesModal;
