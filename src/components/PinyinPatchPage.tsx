import { PinyinPatch } from '../types';

interface PinyinPatchPageProps {
    patches: PinyinPatch[];
    onBack: () => void;
    onRemovePatch: (idiom: string) => void;
    onClearAllPatches: () => void;
}

function PinyinPatchPage({ patches, onBack, onRemovePatch, onClearAllPatches }: PinyinPatchPageProps) {
    const handleClearAll = () => {
        if (confirm('确定要清空所有拼音修正吗？')) {
            onClearAllPatches();
        }
    };

    const handleDelete = (idiom: string) => {
        if (confirm(`确定要删除"${idiom}"的拼音修正吗？`)) {
            onRemovePatch(idiom);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    };

    return (
        <div className="game-container">
            <header className="game-header">
                <button className="btn-back" onClick={onBack}>
                    ←
                </button>
                <div className="header-title">
                    <h1>拼音修正</h1>
                </div>
            </header>

            <div className="patch-page-content">
                {patches.length === 0 ? (
                    <div className="empty-state">
                        <p>暂无拼音修正记录</p>
                        <p className="empty-hint">在成语详情弹窗中点击"修正拼音"来添加</p>
                    </div>
                ) : (
                    <>
                        <div className="patch-header">
                            <span className="patch-count">共 {patches.length} 条修正</span>
                            <button className="btn btn-text" onClick={handleClearAll}>
                                清空
                            </button>
                        </div>

                        <div className="patch-list">
                            {patches.map(patch => (
                                <div key={patch.idiom} className="patch-item">
                                    <div className="patch-item-header">
                                        <h3 className="patch-idiom">{patch.idiom}</h3>
                                        <button
                                            className="btn-icon"
                                            title="删除"
                                            onClick={() => handleDelete(patch.idiom)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="patch-item-body">
                                        <div className="patch-pinyin-row">
                                            <span className="patch-label">原拼音:</span>
                                            <span className="patch-pinyin-original">{patch.originalPinyin}</span>
                                        </div>
                                        <div className="patch-pinyin-row">
                                            <span className="patch-label">修正后:</span>
                                            <span className="patch-pinyin-corrected">{patch.correctedPinyin}</span>
                                        </div>
                                    </div>
                                    <div className="patch-item-footer">
                                        <span className="patch-date">{formatDate(patch.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PinyinPatchPage;
