/**
 * A raw glucose reading from the  Librelink Up API.
 */
export interface RawGlucoseReading {
    FactoryTimestamp: string;
    Timestamp: string;
    type: number;
    ValueInMgPerDl: number;
    TrendArrow?: number;
    TrendMessage?: null;
    MeasurementColor: number;
    GlucoseUnits: number;
    Value: number;
    isHigh: boolean;
    isLow: boolean;
}

/**
 * A processed glucose reading.
 */
export interface GlucoseReading {
    timestamp: Date;
    value: number;
    measurementColor: MeasurementColor;
    isHigh: boolean;
    isLow: boolean;
    trend: number;
}

export interface Ticket {
    token: string;
    expires: number;
    duration: number;
}

export enum MeasurementColor {
    Red = 0,
    Green = 1,
    Yellow = 2,
    Orange = 3,
}

export type TrendType = 'NotComputable' | 'SingleDown' | 'FortyFiveDown' | 'Flat' | 'FortyFiveUp' | 'SingleUp';

export enum Trend {
    NotComputable = 0,
    SingleDown = 1,
    FortyFiveDown = 2,
    Flat = 3,
    FortyFiveUp = 4,
    SingleUp = 5,
}
