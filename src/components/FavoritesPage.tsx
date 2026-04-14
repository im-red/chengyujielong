import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { idiomLib } from '../idiomLib';
import { FavoriteItem } from '../hooks/useFavorites';

interface FavoritesPageProps {
    favorites: FavoriteItem[];
    onBack: () => void;
    onShowDetail: (idiom: string) => void;
    onRemoveFavorite: (idiom: string) => void;
}

interface GroupedFavorites {
    pinyin: string;
    idioms: Array<{
        word: string;
        pinyin: string;
        explanation: string;
    }>;
}

function FavoritesPage({ favorites, onBack, onShowDetail, onRemoveFavorite }: FavoritesPageProps) {
    const listContainerRef = useRef<HTMLDivElement>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    const groupedFavorites: GroupedFavorites[] = useMemo(() => {
        const groups = new Map<string, GroupedFavorites['idioms']>();

        favorites.forEach(fav => {
            const item = idiomLib['idiomMap'].get(fav.idiom);
            if (!item) return;

            const pinyinRaw = idiomLib.getPinyin(fav.idiom);
            const pinyinList = pinyinRaw.split(' ');
            const leadingPinyin = pinyinList[0] || '';

            const leadingPinyinLower = leadingPinyin.toLowerCase().replace(/[āáǎà]/g, 'a')
                .replace(/[ōóǒò]/g, 'o')
                .replace(/[ēéěè]/g, 'e')
                .replace(/[īíǐì]/g, 'i')
                .replace(/[ūúǔù]/g, 'u')
                .replace(/[ǖǘǚǜ]/g, 'ü');

            if (!groups.has(leadingPinyinLower)) {
                groups.set(leadingPinyinLower, []);
            }

            groups.get(leadingPinyinLower)!.push({
                word: item.word,
                pinyin: pinyinRaw,
                explanation: item.explanation
            });
        });

        const sortedGroups = Array.from(groups.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([pinyin, idioms]) => ({
                pinyin,
                idioms: idioms.sort((a, b) => a.word.localeCompare(b.word, 'zh-CN'))
            }));

        return sortedGroups;
    }, [favorites]);

    useEffect(() => {
        const allPinyins = new Set(groupedFavorites.map(g => g.pinyin));
        setExpandedSections(allPinyins);
    }, [groupedFavorites.length]);

    const toggleSection = useCallback((pinyin: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pinyin)) {
                newSet.delete(pinyin);
            } else {
                newSet.add(pinyin);
            }
            return newSet;
        });
    }, []);

    const handleIdiomClick = useCallback((idiom: string) => {
        onShowDetail(idiom);
    }, [onShowDetail]);

    const handleRemoveFavorite = useCallback((e: React.MouseEvent, idiom: string) => {
        e.stopPropagation();
        onRemoveFavorite(idiom);
    }, [onRemoveFavorite]);

    const totalIdioms = useMemo(() => {
        return favorites.length;
    }, [favorites]);

    return (
        <div className="favorites-container">
            <header className="app-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>收藏夹</h1>
                </div>
            </header>

            <div className="favorites-stats">
                <span>共 {totalIdioms} 个成语</span>
            </div>

            {groupedFavorites.length === 0 ? (
                <div className="favorites-empty">
                    <p>暂无收藏的成语</p>
                    <p className="favorites-empty-hint">在成语详情页点击星星图标添加收藏</p>
                </div>
            ) : (
                <div className="favorites-list" ref={listContainerRef}>
                    {groupedFavorites.map(group => (
                        <div key={group.pinyin} className="favorites-section">
                            <div
                                className="favorites-section-header"
                                onClick={() => toggleSection(group.pinyin)}
                            >
                                <span className="favorites-section-pinyin">{group.pinyin}</span>
                                <span className="favorites-section-count">{group.idioms.length}</span>
                                <span className={`favorites-section-toggle ${expandedSections.has(group.pinyin) ? 'expanded' : ''}`}>
                                    ▼
                                </span>
                            </div>
                            {expandedSections.has(group.pinyin) && (
                                <div className="favorites-section-items">
                                    {group.idioms.map(item => (
                                        <div
                                            key={item.word}
                                            className="favorites-item"
                                            onClick={() => handleIdiomClick(item.word)}
                                        >
                                            <div className="favorites-item-content">
                                                <div className="favorites-item-word">{item.word}</div>
                                                <div className="favorites-item-pinyin">{item.pinyin}</div>
                                                <div className="favorites-item-explanation">{item.explanation}</div>
                                            </div>
                                            <button
                                                className="favorites-item-remove"
                                                onClick={(e) => handleRemoveFavorite(e, item.word)}
                                                title="取消收藏"
                                            >
                                                ★
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;
