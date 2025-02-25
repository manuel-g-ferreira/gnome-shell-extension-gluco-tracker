'use strict';

import Soup from 'gi://Soup';
import {GlucoAPI} from '../glucoApi.js';
import SettingsHelper from '../../preferences/settingsHelper.js';
import {Keys} from '../../preferences/settingsKeys.js';
import {LoginResponse, RedirectResponse, RegionalMapResponse, Response} from './types/responses.js';
import {LibreLinkUpEndpoints, DefaultHeaders} from './configurations.js';
import {get, post} from '../http.js';

export class LibreLinkAPI implements GlucoAPI {
    private readonly _session: Soup.Session = new Soup.Session();
    private baseUrl: string = SettingsHelper.get_string(Keys.LIBRE_LINK_API_URL) || '';

    constructor() {
        this._session.set_user_agent(
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        );
    }

    public async login(email: string, password: string): Promise<void> {
        try {
            type Response = LoginResponse | RedirectResponse;
            const url = `${this.baseUrl}${LibreLinkUpEndpoints.Login}`;
            const response = await post<Response>(
                this._session,
                url,
                JSON.stringify({email, password}),
                this.getDefaultHeaders(),
            );
            if (response.status === 2) {
                throw new Error(
                    'Invalid credentials. Please ensure that the email and password work with the LibreLinkUp app.',
                );
            }
            if (!response.data) {
                throw new Error('No data returned from Libre Link Up API.');
            }
            if ('redirect' in response.data) {
                const newApiUrl = await this.findRegion(response.data.region);
                SettingsHelper.set_string(Keys.LIBRE_LINK_API_URL, newApiUrl);
                return await this.login(email, password);
            }
            SettingsHelper.set_string(Keys.ACCESS_TOKEN, response.data.authTicket.token);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            throw new Error(`Error logging into Libre Link Up API. ${error.message}`);
        }
    }

    private async findRegion(region: string): Promise<string> {
        try {
            const url = `${this.baseUrl}${LibreLinkUpEndpoints.Country}`;
            const response = await get<Response>(this._session, url, this.getDefaultHeaders());
            const data = response.data as RegionalMapResponse | undefined;
            const lslApi = data?.regionalMap[region]?.lslApi;
            if (!lslApi) {
                throw new Error('Region not found in Libre Link Up API.');
            }
            SettingsHelper.set_string(Keys.LIBRE_LINK_API_URL, lslApi);
            return lslApi;
        } catch (err) {
            const error = err as Error;
            throw new Error(`Error finding region in Libre Link Up API. ${error.message}`);
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
}
