import { GlucoseReading } from "../models/glucoseReading.js";

// A generic interface for a glucose API.
export interface GlucoAPI {
    login(): Promise<void>;
    fetchGlucoseReadings(): Promise<GlucoseReading[]>;
    getAccessToken(): string;
}
