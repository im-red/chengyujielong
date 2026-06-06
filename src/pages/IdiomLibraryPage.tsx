import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSearchbar,
} from '@ionic/react';
import { useApp } from '../data/AppContext';
import { idiomLib } from '../util/idiomLib';
import { highlightText } from '../util/utils';
import './IdiomLibraryPage.scss';

const IdiomLibraryPage: React.FC = () => {
  const { setDetailModalIdiom } = useApp();
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

  const handleIdiomClick = (idiom: string) => {
    setDetailModalIdiom(idiom, searchQuery.trim());
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>成语词典</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="library-search-container">
          <IonSearchbar
            placeholder="搜索成语、拼音或释义..."
            value={searchQuery}
            onIonInput={(e) => setSearchQuery(e.detail.value ?? '')}
            debounce={200}
          />
          <div className="library-filter-buttons">
            <button
              onClick={() => setStartWithKeyword(!startWithKeyword)}
              className={`library-filter-btn ${startWithKeyword ? 'active' : 'inactive'}`}
            >
              {startWithKeyword ? '✓ ' : ''}开头匹配
            </button>
            <button
              onClick={() => setMatchDetails(!matchDetails)}
              className={`library-filter-btn ${matchDetails ? 'active' : 'inactive'}`}
            >
              {matchDetails ? '✓ ' : ''}搜索释义
            </button>
          </div>
        </div>

        <div className="library-stats">
          共 {allIdioms.length} 个成语
          {searchQuery && <span> · 匹配 {filteredIdioms.length} 个</span>}
        </div>

        <div
          ref={listContainerRef}
          onScroll={handleScroll}
          className="library-list-container"
        >
          {displayedIdioms.length === 0 ? (
            <div className="library-empty">
              <p>未找到匹配的成语</p>
            </div>
          ) : (
            <>
              {displayedIdioms.map((item) => (
                <div
                  key={item.word}
                  onClick={() => handleIdiomClick(item.word)}
                  className="library-item"
                >
                  <div className="library-item-word">
                    {highlightText(item.word, searchQuery, startWithKeyword)}
                  </div>
                  <div className="library-item-pinyin">
                    {highlightText(item.pinyin, searchQuery, startWithKeyword)}
                  </div>
                  <div className="library-item-explanation">
                    {highlightText(item.explanation, searchQuery, startWithKeyword)}
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="library-loading-more">
                  加载更多...
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default IdiomLibraryPage;
