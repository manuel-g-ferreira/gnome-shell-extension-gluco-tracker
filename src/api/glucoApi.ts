import {GlucoseReading} from './librelink/types/reading.js';

export interface GlucoAPI {
    login(email: string, password: string): Promise<void>;
    read(): Promise<GlucoseReading>;
}
