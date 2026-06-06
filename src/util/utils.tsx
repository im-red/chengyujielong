import React from 'react';

export function highlightText(text: string, query: string, startWithKeyword: boolean = true): React.ReactNode {
    if (!query.trim()) {
        return text;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const normalizedText = text.toLowerCase();
    
    let matchIndex: number;
    
    if (startWithKeyword) {
        matchIndex = normalizedText.startsWith(normalizedQuery) ? 0 : -1;
    } else {
        matchIndex = normalizedText.indexOf(normalizedQuery);
    }

    if (matchIndex === -1) {
        return text;
    }

    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + query.length);
    const after = text.slice(matchIndex + query.length);

    return (
        <>
            {before}
            <span className="highlight">{match}</span>
            {highlightText(after, query, false)}
        </>
    );
}
