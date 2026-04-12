import { IdiomItem, RecordType, PinyinPatch } from './types';
import idiomsData from '../idiom.json';

class IdiomLib {
    private idiomMap: Map<string, IdiomItem> = new Map();
    private candidateList: Map<string, string[]> = new Map();
    private usedCandidateList: Map<string, string[]> = new Map();
    private unusedCandidateList: Map<string, string[]> = new Map();
    private testMode: boolean = false;
    private testSequence: string[] = [];
    private testSequenceIndex: number = 0;
    private patches: Map<string, PinyinPatch> = new Map();

    constructor() {
        this.loadIdioms();
    }

    setPatches(patches: PinyinPatch[]) {
        this.patches.clear();
        patches.forEach(p => this.patches.set(p.idiom, p));
        console.info('[IdiomLib] Applied', patches.length, 'pinyin patches');
    }

    getPinyin(idiom: string): string {
        const item = this.idiomMap.get(idiom);
        if (!item) return '';
        const patch = this.patches.get(idiom);
        return patch ? patch.correctedPinyin : item.pinyin;
    }

    setTestMode(enabled: boolean, sequence?: string[]) {
        this.testMode = enabled;
        this.testSequence = sequence || [];
        this.testSequenceIndex = 0;
        console.info('[IdiomLib] Test mode:', enabled, 'sequence:', sequence);
    }

    private translatePinyin(pinyin: string): string {
        const pinyinMap: Record<string, string> = {
            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
            'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
        };

        return pinyin.split('').map(char => pinyinMap[char] || char).join('');
    }

    private loadIdioms() {
        const idioms = idiomsData as IdiomItem[];

        idioms.forEach(item => {
            this.idiomMap.set(item.word, item);

            const pinyinList = item.pinyin.split(' ').map(p => this.translatePinyin(p));
            const firstPinyin = pinyinList[0];

            if (!this.candidateList.has(firstPinyin)) {
                this.candidateList.set(firstPinyin, []);
            }
            this.candidateList.get(firstPinyin)!.push(item.word);
        });

        this.unusedCandidateList = new Map();
        this.candidateList.forEach((value, key) => {
            this.unusedCandidateList.set(key, [...value]);
        });
        console.info('[IdiomLib] Loaded idioms:', this.idiomMap.size);
    }

    reset() {
        this.usedCandidateList.clear();
        this.unusedCandidateList = new Map();
        this.candidateList.forEach((value, key) => {
            this.unusedCandidateList.set(key, [...value]);
        });
        this.testSequenceIndex = 0;
    }

    appendIdiom(history: string[], next: string): RecordType {
        const item = this.idiomMap.get(next);
        if (!item) {
            return RecordType.IdiomNotExist;
        }

        if (history.includes(next)) {
            return RecordType.IdiomDuplicate;
        }

        if (history.length > 0) {
            const lastIdiom = history[history.length - 1];
            const lastPinyinRaw = this.getPinyin(lastIdiom);
            const lastPinyinList = lastPinyinRaw.split(' ').map(p => this.translatePinyin(p));
            const lastPinyin = lastPinyinList[lastPinyinList.length - 1];

            const nextPinyinRaw = this.getPinyin(next);
            const nextPinyinList = nextPinyinRaw.split(' ').map(p => this.translatePinyin(p));
            const firstPinyin = nextPinyinList[0];

            if (lastPinyin !== firstPinyin) {
                return RecordType.PinyinNotMatch;
            }
        }

        return RecordType.NoError;
    }

    pickNext(history: string[]): string | null {
        if (this.testMode && this.testSequence.length > 0) {
            if (this.testSequenceIndex < this.testSequence.length) {
                const nextIdiom = this.testSequence[this.testSequenceIndex];
                this.testSequenceIndex++;
                console.info('[IdiomLib] Test mode: returning', nextIdiom);
                return nextIdiom;
            }
        }

        let lastPinyin: string;

        if (history.length === 0) {
            const keys = Array.from(this.unusedCandidateList.keys());
            if (keys.length === 0) return null;
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            lastPinyin = randomKey;
        } else {
            const lastIdiom = history[history.length - 1];
            const lastPinyinRaw = this.getPinyin(lastIdiom);
            const pinyinList = lastPinyinRaw.split(' ').map(p => this.translatePinyin(p));
            lastPinyin = pinyinList[pinyinList.length - 1];
        }

        const candidates = this.unusedCandidateList.get(lastPinyin);
        if (!candidates || candidates.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * candidates.length);
        return candidates[randomIndex];
    }

    markUsed(idiom: string) {
        const item = this.idiomMap.get(idiom);
        if (!item) return;

        const pinyinList = item.pinyin.split(' ').map(p => this.translatePinyin(p));
        const firstPinyin = pinyinList[0];

        const unusedList = this.unusedCandidateList.get(firstPinyin);
        if (unusedList) {
            const index = unusedList.indexOf(idiom);
            if (index !== -1) {
                unusedList.splice(index, 1);
            }
        }

        if (!this.usedCandidateList.has(firstPinyin)) {
            this.usedCandidateList.set(firstPinyin, []);
        }
        this.usedCandidateList.get(firstPinyin)!.push(idiom);
    }

    getExtraInfo(idiom: string): string {
        const item = this.idiomMap.get(idiom);
        if (!item) return '';

        const pinyin = this.getPinyin(idiom);
        const patch = this.patches.get(idiom);
        const patchInfo = patch ? ' (已修正)' : '';

        return `拼音: ${pinyin}${patchInfo}\n出处: ${item.derivation}\n释义: ${item.explanation}\n例子: ${item.example}`;
    }

    getCandidateList(idiom: string): string[] {
        const pinyinRaw = this.getPinyin(idiom);
        if (!pinyinRaw) return [];

        const pinyinList = pinyinRaw.split(' ').map(p => this.translatePinyin(p));
        const lastPinyin = pinyinList[pinyinList.length - 1];

        return this.candidateList.get(lastPinyin) || [];
    }

    getUnusedCandidateList(idiom: string): string[] {
        const pinyinRaw = this.getPinyin(idiom);
        if (!pinyinRaw) return [];

        const pinyinList = pinyinRaw.split(' ').map(p => this.translatePinyin(p));
        const lastPinyin = pinyinList[pinyinList.length - 1];

        return this.unusedCandidateList.get(lastPinyin) || [];
    }
}

export const idiomLib = new IdiomLib();
