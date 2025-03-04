import {User, DataMessages, Notifications, AuthTicket, Sensor, Device} from './user.js';
import {Connection} from './connection.js';
import {RawGlucoseReading, Ticket} from './reading.js';

/**
 * A response from the  Librelink Up API.
 */
export interface Response {
    status: number;
    data?: Record<string, unknown>;
    error?: Record<string, unknown>;
}

/**
 * The successful login response from the  Librelink Up API.
 */
export interface LoginResponse extends Response {
    data: {
        user: User;
        messages: DataMessages;
        notifications: Notifications;
        authTicket: AuthTicket;
        invitations: string[] | null;
        trustedDeviceToken: string | '';
    };
}

/**
 * The redirect response from the  Librelink Up API.
 */
export interface RedirectResponse extends Response {
    data: {
        redirect: boolean;
        region: string;
    };
}

/**
 * An error response from the  Librelink Up API.
 */
export interface ErrorResponse extends Response {
    error: {
        message: string;
    };
}

/**
 * A connection response from the  Librelink Up API.
 */
export interface ConnectionResponse extends Response {
    status: number;
    data: {
        connection: Connection;
        activeSensors: ActiveSensor[];
        graphData: RawGlucoseReading[];
    };
    ticket: Ticket;
}

export interface ActiveSensor {
    sensor: Sensor;
    device: Device;
}

export interface RegionalMapResponse {
    regionalMap: {
        [region: string]: {lslApi: string};
    };
}
