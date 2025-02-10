import {RawGlucoseReading} from "../api/librelink/types.js";

export class GlucoseReading {
    public timestamp: Date;
    public value: number;
    public measurementColor: number;
    public trend: string;

    constructor(rawReading: RawGlucoseReading) {
        this.timestamp = new Date(rawReading.Timestamp);
        this.value = rawReading.ValueInMgPerDl;
        this.measurementColor = rawReading.MeasurementColor;
        this.trend = rawReading.TrendArrow ? `Trend-${rawReading.TrendArrow}` : "Unknown";
    }
}
