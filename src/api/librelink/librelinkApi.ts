'use strict';

import Soup from 'gi://Soup';
import {GlucoAPI} from '../glucoApi.js';
import SettingsHelper from '../../settings/helper.js';
import {Keys} from '../../settings/keys.js';
import {ConnectionResponse, LoginResponse, RedirectResponse, RegionalMapResponse, Response} from './types/responses.js';
import {DefaultHeaders, LibreLinkUpEndpoints} from './configurations.js';
import {get, post} from '../http.js';
import {GlucoseReading, RawGlucoseReading} from './types/reading.js';
import GLib from 'gi://GLib';
import {handleApiError} from '../errorHandler.js';

export class LibreLinkAPI implements GlucoAPI {
    private readonly _session: Soup.Session = new Soup.Session();
    private baseUrl: string = SettingsHelper.get_string(Keys.LIBRE_LINK_API_URL) || '';
    private patientId: string = '';
    private accessToken: string = '';

    constructor() {
        this._session.set_user_agent(
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        );
    }

    public async login(email: string, password: string): Promise<void> {
        try {
            type Resp = LoginResponse | RedirectResponse;
            const url = `${this.baseUrl}${LibreLinkUpEndpoints.Login}`;
            const response = await post<Resp>(
                this._session,
                url,
                JSON.stringify({email, password}),
                this.getDefaultHeaders(),
            );
            if (response.status === 2) {
                throw {message: 'Invalid credentials', status: 2};
            }
            if (response.status === 429) {
                throw {message: 'Too many requests. Please try again later.', status: 429};
            }
            if (!response.data) {
                throw {message: 'System error.', status: 'SYSTEM_ERROR'};
            }
            if ('redirect' in response.data) {
                const newApiUrl = await this.findRegion(response.data.region);
                SettingsHelper.set_string(Keys.LIBRE_LINK_API_URL, newApiUrl);
                return await this.login(email, password);
            }
            this.accessToken = response.data.authTicket.token;
            SettingsHelper.set_string(Keys.ACCESS_TOKEN, this.accessToken);
            SettingsHelper.set_string(Keys.ACCOUNT_ID, response.data.user.id);
        } catch (err) {
            handleApiError(err, 'login');
        }
    }

    public async read(): Promise<GlucoseReading> {
        try {
            if (!SettingsHelper.get_string(Keys.ACCESS_TOKEN)) {
                throw {message: 'Access token is not set.', status: 'TOKEN_NOT_SET'};
            }

            const response = await this.fetchReading();
            const raw: RawGlucoseReading = response.data.connection.glucoseItem;
            return {
                timestamp: new Date(raw.Timestamp),
                value: raw.ValueInMgPerDl,
                measurementColor: raw.MeasurementColor,
                isHigh: raw.isHigh,
                isLow: raw.isLow,
                trend: raw.TrendArrow !== undefined ? raw.TrendArrow : 0,
            };
        } catch (err) {
            return handleApiError(err, 'read');
        }
    }

    public async history(): Promise<GlucoseReading[]> {
        try {
            const response = await this.fetchReading();
            return response.data.graphData.map((item: RawGlucoseReading) => ({
                timestamp: new Date(item.Timestamp),
                value: item.ValueInMgPerDl,
                measurementColor: item.MeasurementColor,
                isHigh: item.isHigh,
                isLow: item.isLow,
                trend: item.TrendArrow !== undefined ? item.TrendArrow : 0,
            }));
        } catch (err) {
            handleApiError(err, 'history');
        }
    }

    private async fetchReading(): Promise<ConnectionResponse> {
        try {
            const patientId = await this.getPatientId();

            // Build a custom header with the hashed account ID.
            const accountId = SettingsHelper.get_string(Keys.ACCOUNT_ID);
            const accountIdHeader = {
                'Account-Id': accountId ? this.encryptSha256(accountId) : '',
            };

            const headers = {...this.getDefaultHeaders(), ...accountIdHeader};
            const url = `${LibreLinkUpEndpoints.Connections}/${patientId}/graph`;
            return await get<ConnectionResponse>(this._session, `${this.baseUrl}${url}`, headers);
        } catch (err) {
            handleApiError(err, 'fetchReading');
        }
    }

    private async getPatientId(): Promise<string> {
        try {
            if (this.patientId) return this.patientId;
            const connectionsResponse = await this.fetchConnections();
            if (
                !connectionsResponse.data ||
                (Array.isArray(connectionsResponse.data) && connectionsResponse.data.length === 0)
            ) {
                throw {
                    message: 'No connections found. Please ensure that you have a connection with the LibreLinkUp app.',
                    status: 'NO_CONNECTIONS',
                };
            }
            const patientId = Array.isArray(connectionsResponse.data) ? connectionsResponse.data[0].patientId : '';
            if (!patientId) {
                throw {message: 'Patient ID not found in connections.', status: 'NO_PATIENT_ID'};
            }
            this.patientId = patientId;
            return patientId;
        } catch (err) {
            handleApiError(err, 'getPatientId');
        }
    }

    private async fetchConnections(): Promise<Response> {
        try {
            const url = `${LibreLinkUpEndpoints.Connections}`;
            const accountId = SettingsHelper.get_string(Keys.ACCOUNT_ID);
            const accountIdHeader = {
                'Account-Id': accountId ? this.encryptSha256(accountId) : '',
            };
            const headers = {...this.getDefaultHeaders(), ...accountIdHeader};
            const response = await get<Response>(this._session, `${this.baseUrl}${url}`, headers);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response;
            } else {
                throw {message: 'Unexpected response format for connections.', status: 'INVALID_RESPONSE'};
            }
        } catch (err) {
            handleApiError(err, 'fetchConnections');
        }
    }

    private async findRegion(region: string): Promise<string> {
        try {
            const url = `${LibreLinkUpEndpoints.Country}`;
            const response = await get<Response>(this._session, `${this.baseUrl}${url}`, this.getDefaultHeaders());
            const data = response.data as RegionalMapResponse | undefined;
            const lslApi = data?.regionalMap[region]?.lslApi;
            if (!lslApi) {
                throw {message: 'Region not found.', status: 'REGION_NOT_FOUND'};
            }
            SettingsHelper.set_string(Keys.LIBRE_LINK_API_URL, lslApi);
            return lslApi;
        } catch (err) {
            handleApiError(err, 'findRegion');
        }
    }

    private getDefaultHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
        const accessToken = SettingsHelper.get_string(Keys.ACCESS_TOKEN);
        const defaultHeaders: Record<string, string> = {
            ...DefaultHeaders,
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
        };
        return {...defaultHeaders, ...customHeaders};
    }

    private encryptSha256(data: string): string {
        const checksum = GLib.Checksum.new(GLib.ChecksumType.SHA256);
        checksum.update(data);
        return checksum.get_string();
    }
}
