export class TrendFormatter {
    private static readonly _trendArrows: Record<number, string> = {
        1: '↓', // Falling quickly
        2: '↘', // Falling
        3: '→', // Stable
        4: '↗', // Rising
        5: '↑', // Rising quickly
    };

    static getTrendArrow(trend: number): string {
        return this._trendArrows[trend] || '';
    }

    static formatDiff(current: number, previous: number): string {
        if (previous === 0) return '';

        const diff = current - previous;
        return diff > 0 ? `+${diff}` : `${diff}`;
    }
}
