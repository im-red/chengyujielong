import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { idiomLib } from '../idiomLib';
import { IdiomItem } from '../types';
import { highlightText } from '../utils';

interface IdiomLibraryPageProps {
    onBack: () => void;
    onShowDetail: (idiom: string, searchQuery?: string) => void;
}

function IdiomLibraryPage({ onBack, onShowDetail }: IdiomLibraryPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [displayCount, setDisplayCount] = useState(50);
    const [matchDetails, setMatchDetails] = useState(false);
    const [startWithKeyword, setStartWithKeyword] = useState(true);
    const listContainerRef = useRef<HTMLDivElement>(null);

    const allIdioms = useMemo(() => {
        return idiomLib.getAllIdioms().sort((a, b) => a.word.localeCompare(b.word, 'zh-CN'));
    }, []);

    const filteredIdioms = useMemo(() => {
        if (!searchQuery.trim()) {
            return allIdioms;
        }
        const query = searchQuery.toLowerCase().trim();

        return allIdioms.filter((item) => {
            const wordLower = item.word.toLowerCase();
            const pinyinLower = item.pinyin.toLowerCase();
            const pinyinNoTones = idiomLib.getPinyinWithoutTones(item.word).toLowerCase();
            const abbreviationLower = item.abbreviation.toLowerCase();

            const matchWord = startWithKeyword
                ? wordLower.startsWith(query)
                : wordLower.includes(query);

            const matchPinyin = startWithKeyword
                ? pinyinLower.startsWith(query) || pinyinNoTones.startsWith(query)
                : pinyinLower.includes(query) || pinyinNoTones.includes(query);

            const matchAbbreviation = startWithKeyword
                ? abbreviationLower.startsWith(query)
                : abbreviationLower.includes(query);

            let matchDetail = false;
            if (matchDetails) {
                const explanationLower = item.explanation.toLowerCase();
                const derivationLower = item.derivation.toLowerCase();
                const exampleLower = item.example.toLowerCase();

                matchDetail = startWithKeyword
                    ? explanationLower.startsWith(query) || derivationLower.startsWith(query) || exampleLower.startsWith(query)
                    : explanationLower.includes(query) || derivationLower.includes(query) || exampleLower.includes(query);
            }

            return matchWord || matchPinyin || matchAbbreviation || matchDetail;
        });
    }, [allIdioms, searchQuery, matchDetails, startWithKeyword]);

    const displayedIdioms = useMemo(() => {
        return filteredIdioms.slice(0, displayCount);
    }, [filteredIdioms, displayCount]);

    const hasMore = displayedIdioms.length < filteredIdioms.length;

    const handleScroll = useCallback(() => {
        if (!listContainerRef.current || !hasMore) return;

        const container = listContainerRef.current;
        const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

        if (scrollBottom < 200) {
            setDisplayCount((prev) => Math.min(prev + 50, filteredIdioms.length));
        }
    }, [hasMore, filteredIdioms.length]);

    useEffect(() => {
        setDisplayCount(50);
    }, [searchQuery, matchDetails, startWithKeyword]);

    const handleIdiomClick = useCallback((idiom: string) => {
        onShowDetail(idiom, searchQuery.trim());
    }, [onShowDetail, searchQuery]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const toggleMatchDetails = useCallback(() => {
        setMatchDetails((prev) => !prev);
    }, []);

    const toggleStartWithKeyword = useCallback(() => {
        setStartWithKeyword((prev) => !prev);
    }, []);

    return (
        <div className="idiom-library-container">
            <header className="game-header">
                <button className="btn-back" onClick={onBack}>
                    ←
                </button>
                <div className="header-title">
                    <h1>成语词典</h1>
                </div>
            </header>

            <div className="idiom-library-search">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="搜索成语、拼音或释义..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={handleClearSearch}>
                            ×
                        </button>
                    )}
                </div>
                <div className="search-options">
                    <button
                        className={`search-option-btn ${startWithKeyword ? 'active' : ''}`}
                        onClick={toggleStartWithKeyword}
                    >
                        {startWithKeyword ? '✓ ' : ''}
                        开头匹配
                    </button>
                    <button
                        className={`search-option-btn ${matchDetails ? 'active' : ''}`}
                        onClick={toggleMatchDetails}
                    >
                        {matchDetails ? '✓ ' : ''}
                        搜索释义
                    </button>
                </div>
            </div>

            <div className="idiom-library-stats">
                <span>共 {allIdioms.length} 个成语</span>
                {searchQuery && <span> · 匹配 {filteredIdioms.length} 个</span>}
            </div>

            <div
                className="idiom-library-list"
                ref={listContainerRef}
                onScroll={handleScroll}
            >
                {displayedIdioms.length === 0 ? (
                    <div className="empty-state">
                        <p>未找到匹配的成语</p>
                    </div>
                ) : (
                    <>
                        {displayedIdioms.map((item) => (
                            <div
                                key={item.word}
                                className="idiom-item"
                                onClick={() => handleIdiomClick(item.word)}
                            >
                                <div className="idiom-word">{highlightText(item.word, searchQuery, startWithKeyword)}</div>
                                <div className="idiom-pinyin">{highlightText(item.pinyin, searchQuery, startWithKeyword)}</div>
                                <div className="idiom-explanation">{highlightText(item.explanation, searchQuery, startWithKeyword)}</div>
                            </div>
                        ))}
                        {hasMore && (
                            <div className="idiom-load-more">
                                加载更多...
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default IdiomLibraryPage;
