import {RawGlucoseReading} from './reading.js';
import {AlarmRules, Device, Sensor} from './user.js';

/**
 * A connection object from the  Librelink Up API.
 */
export interface Connection {
    id: string;
    patientId: string;
    country: string;
    status: number;
    firstName: string;
    lastName: string;
    targetLow: number;
    targetHigh: number;
    uom: number;
    sensor: Sensor;
    alarmRules: AlarmRules;
    glucoseMeasurement: RawGlucoseReading;
    glucoseItem: RawGlucoseReading;
    glucoseAlarm: null;
    patientDevice: Device;
    created: number;
}
