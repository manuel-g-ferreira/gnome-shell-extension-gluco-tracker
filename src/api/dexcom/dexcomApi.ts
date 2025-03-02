import {GlucoAPI} from '../glucoApi.js';
import {GlucoseReading} from '../librelink/types/reading.js';

export class DexcomAPI implements GlucoAPI {
    async login(): Promise<void> {
        // Not implemented
        throw new Error('Method not implemented.');
    }

    async read(): Promise<GlucoseReading> {
        // Not implemented
        throw new Error('Method not implemented.');
    }
}
