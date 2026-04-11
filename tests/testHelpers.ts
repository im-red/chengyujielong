export const TEST_IDIOM_SEQUENCE = [
    '一心一意',
    '发愤图强',
    '理直气壮',
    '云开雾散',
    '勇往直前'
];

export const TEST_USER_RESPONSES = {
    '一心一意': '意气风发',
    '发愤图强': '强词夺理',
    '理直气壮': '壮志凌云',
    '云开雾散': '散兵游勇',
    '勇往直前': '前仆后继',
};

export function setupTestMode(page: any, sequence: string[] = TEST_IDIOM_SEQUENCE) {
    return page.evaluate((seq) => {
        // @ts-ignore
        const lib = window.idiomLib;
        if (lib && typeof lib.setTestMode === 'function') {
            lib.setTestMode(true, seq);
            return true;
        }
        return false;
    }, sequence);
}

export function disableTestMode(page: any) {
    return page.evaluate(() => {
        // @ts-ignore
        const lib = window.idiomLib;
        if (lib && typeof lib.setTestMode === 'function') {
            lib.setTestMode(false);
            return true;
        }
        return false;
    });
}

export function getTestUserResponse(computerIdiom: string): string | undefined {
    return TEST_USER_RESPONSES[computerIdiom];
}
