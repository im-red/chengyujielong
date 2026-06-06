import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
} from '@ionic/react';
import { useApp } from '../data/AppContext';
import { idiomLib } from '../util/idiomLib';
import './FavoritesPage.scss';

interface GroupedFavorites {
  pinyin: string;
  idioms: Array<{
    word: string;
    pinyin: string;
    explanation: string;
  }>;
}

const FavoritesPage: React.FC = () => {
  const { favorites, setDetailModalIdiom, removeFavorite } = useApp();
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
    setDetailModalIdiom(idiom);
  }, [setDetailModalIdiom]);

  const handleRemoveFavorite = useCallback((e: React.MouseEvent, idiom: string) => {
    e.stopPropagation();
    removeFavorite(idiom);
  }, [removeFavorite]);

  const totalIdioms = favorites.length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>收藏夹</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="favorites-stats">
          共 {totalIdioms} 个成语
        </div>

        {groupedFavorites.length === 0 ? (
          <div className="favorites-empty">
            <p>暂无收藏的成语</p>
            <p className="favorites-empty-sub">在成语详情页点击星星图标添加收藏</p>
          </div>
        ) : (
          <div className="favorites-list-container">
            {groupedFavorites.map(group => (
              <div key={group.pinyin} className="favorite-group">
                <div
                  onClick={() => toggleSection(group.pinyin)}
                  className="favorite-group-header"
                >
                  <span className="favorite-group-title">{group.pinyin}</span>
                  <span className="favorite-group-count">
                    {group.idioms.length}
                  </span>
                  <span className={`favorite-group-arrow ${expandedSections.has(group.pinyin) ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
                {expandedSections.has(group.pinyin) && (
                  <div className="favorite-items-container">
                    {group.idioms.map(item => (
                      <div
                        key={item.word}
                        onClick={() => handleIdiomClick(item.word)}
                        className="favorite-item"
                      >
                        <div className="favorite-item-content">
                          <div className="favorite-item-word">{item.word}</div>
                          <div className="favorite-item-pinyin">{item.pinyin}</div>
                          <div className="favorite-item-explanation">
                            {item.explanation}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleRemoveFavorite(e, item.word)}
                          className="btn-remove-favorite"
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
      </IonContent>
    </IonPage>
  );
};

export default FavoritesPage;
