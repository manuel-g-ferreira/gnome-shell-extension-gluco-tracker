'use strict';

import Soup from 'gi://Soup';
import {GlucoAPI} from '../glucoApi.js';
import SettingsHelper from '../../preferences/settingsHelper.js';
import {Keys} from '../../preferences/settingsKeys.js';
import {ConnectionResponse, LoginResponse, RedirectResponse, RegionalMapResponse, Response} from './types/responses.js';
import {DefaultHeaders, LibreLinkUpEndpoints} from './configurations.js';
import {get, post} from '../http.js';
import {GlucoseReading, RawGlucoseReading} from './types/reading.js';
import GLib from 'gi://GLib';

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
        type Resp = LoginResponse | RedirectResponse;
        const url = `${this.baseUrl}${LibreLinkUpEndpoints.Login}`;
        const response = await post<Resp>(
            this._session,
            url,
            JSON.stringify({email, password}),
            this.getDefaultHeaders(),
        );
        if (response.status === 2) {
            throw new Error('Invalid credentials');
        }
        if (response.status === 429 || response.status === 430) {
            throw new Error('Too many requests. Please try again later.');
        }
        if (!response.data) {
            throw new Error('System error.');
        }
        if ('redirect' in response.data) {
            const newApiUrl = await this.findRegion(response.data.region);
            SettingsHelper.set_string(Keys.LIBRE_LINK_API_URL, newApiUrl);
            return await this.login(email, password);
        }
        this.accessToken = response.data.authTicket.token;
        SettingsHelper.set_string(Keys.ACCESS_TOKEN, this.accessToken);
        // Also store the account ID.
        SettingsHelper.set_string(Keys.ACCOUNT_ID, response.data.user.id);
    }

    public async read(): Promise<GlucoseReading> {
        if (!SettingsHelper.get_string(Keys.ACCESS_TOKEN)) {
            throw new Error('Access token is not set.');
        }

        try {
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
            const error = err instanceof Error ? err : new Error(String(err));
            console.error(error);
            throw new Error(`Error reading data from Libre Link Up API. ${error.message}`);
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
            const error = err instanceof Error ? err : new Error(String(err));
            console.error(error);
            throw new Error(`Error fetching history from Libre Link Up API. ${error.message}`);
        }
    }

    private async fetchReading(): Promise<ConnectionResponse> {
        try {
            const patientId = await this.getPatientId();

            // Build a custom header with the hashed account ID.
            const accountId = SettingsHelper.get_string(Keys.ACCOUNT_ID);
            const accountIdHeader = {
                'Account-Id': accountId ? await this.encryptSha256(accountId) : '',
            };

            const headers = {...this.getDefaultHeaders(), ...accountIdHeader};
            const url = `${LibreLinkUpEndpoints.Connections}/${patientId}/graph`;
            return await get<ConnectionResponse>(this._session, `${this.baseUrl}${url}`, headers);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error(error);
            throw new Error(`Error fetching reading from Libre Link Up API. ${error.message}`);
        }
    }

    private async getPatientId(): Promise<string> {
        if (this.patientId) return this.patientId;
        const connectionsResponse = await this.fetchConnections();
        if (
            !connectionsResponse.data ||
            (Array.isArray(connectionsResponse.data) && connectionsResponse.data.length === 0)
        ) {
            throw new Error('No connections found. Please ensure that you have a connection with the LibreLinkUp app.');
        }
        const patientId = Array.isArray(connectionsResponse.data) ? connectionsResponse.data[0].patientId : '';
        if (!patientId) {
            throw new Error('Patient ID not found in connections.');
        }
        this.patientId = patientId;
        return patientId;
    }

    private async fetchConnections(): Promise<Response> {
        try {
            const url = `${LibreLinkUpEndpoints.Connections}`;
            const accountId = SettingsHelper.get_string(Keys.ACCOUNT_ID);
            const accountIdHeader = {
                'Account-Id': accountId ? await this.encryptSha256(accountId) : '',
            };
            const headers = {...this.getDefaultHeaders(), ...accountIdHeader};
            const response = await get<Response>(this._session, `${this.baseUrl}${url}`, headers);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response;
            } else {
                throw new Error('Unexpected response format for connections.');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error(error);
            throw new Error(`Error fetching connections from Libre Link Up API. ${error.message}`);
        }
    }

    private async findRegion(region: string): Promise<string> {
        const url = `${LibreLinkUpEndpoints.Country}`;
        const response = await get<Response>(this._session, `${this.baseUrl}${url}`, this.getDefaultHeaders());
        const data = response.data as RegionalMapResponse | undefined;
        const lslApi = data?.regionalMap[region]?.lslApi;
        if (!lslApi) {
            throw new Error('Region not found.');
        }
        SettingsHelper.set_string(Keys.LIBRE_LINK_API_URL, lslApi);
        return lslApi;
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
