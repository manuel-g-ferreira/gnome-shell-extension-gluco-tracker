'use strict';

import GLib from 'gi://GLib';
import Soup from 'gi://Soup';
import {GlucoAPI} from '../glucoApi.js';
import SettingsHelper from '../../preferences/settingsHelper.js';
import {Keys} from '../../preferences/settingsKeys.js';
import Gio from 'gi://Gio';
import {LoginResponse, RedirectResponse, RegionalMapResponse, Response} from './types/responses.js';
import {LibreLinkUpEndpoints} from './configurations.js';

export class LibreLinkAPI implements GlucoAPI {
    private _session: Soup.Session;

    constructor() {
        this._session = new Soup.Session();
        this._session.set_user_agent(
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        );
    }

    public async login(email: string, password: string): Promise<void> {
        try {
            type Response = LoginResponse | RedirectResponse;
            const response = await this._fetcher<Response>(LibreLinkUpEndpoints.Login, {
                method: 'POST',
                body: JSON.stringify({email, password}),
            });
            if (response.status === 2) {
                throw new Error(
                    'Invalid credentials. Please ensure that the email and password work with the LibreLinkUp app.',
                );
            }
            if (!response.data) {
                throw new Error('No data returned from Libre Link Up API.');
            }
            // Handle redirect response.
            if ('redirect' in response.data) {
                const newApiUrl = await this.findRegion(response.data.region);
                SettingsHelper.set_string(Keys.LIBRE_LINK_API_URL, newApiUrl);
                return await this.login(email, password);
            }
            // On success, store the access token.
            SettingsHelper.set_string(Keys.ACCESS_TOKEN, response.data.authTicket.token);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            throw new Error(`Error logging into Libre Link Up API. ${error.message}`);
        }
    }

    private async findRegion(region: string): Promise<string> {
        try {
            const response = await this._fetcher<Response>(LibreLinkUpEndpoints.Country);
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

    private async _fetcher<T = Response>(
        endpoint: string,
        options: {method?: string; headers?: Record<string, string>; body?: string} = {},
    ): Promise<T> {
        const url = `${SettingsHelper.get_string(Keys.LIBRE_LINK_API_URL)}/${endpoint}`;
        const message = Soup.Message.new(options.method ?? 'GET', url);
        const accessToken = SettingsHelper.get_string(Keys.ACCESS_TOKEN);

        const defaultHeaders: Record<string, string> = {
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
            product: 'llu.android',
            version: '4.7.0',
            'accept-encoding': 'gzip',
            'cache-control': 'no-cache',
            connection: 'Keep-Alive',
            'content-type': 'application/json',
        };

        const headers = {...defaultHeaders, ...options.headers};
        for (const key in headers) {
            message.request_headers.append(key, headers[key]);
        }

        if (options.body) {
            const bodyBytes = new TextEncoder().encode(options.body);
            message.set_request_body_from_bytes('application/json', GLib.Bytes.new_take(bodyBytes));
        }

        return new Promise<T>((resolve, reject) => {
            this._session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (session: Soup.Session | null, result: Gio.AsyncResult) => {
                    try {
                        const responseBody = session!.send_and_read_finish(result);
                        console.log(`Response from ${url}: ${responseBody.get_data()}`);
                        const data = responseBody.get_data() as Uint8Array;
                        const responseText = new TextDecoder('utf-8').decode(data);

                        // Check HTTP status.
                        if (message.get_status() !== Soup.Status.OK) {
                            const errorPayload = JSON.parse(responseText);
                            const errorMessage = errorPayload?.message || JSON.stringify(errorPayload, null, 2);
                            if (message.get_status() === 429) {
                                reject(
                                    new Error(`Too many requests. Please wait before trying again. ${errorMessage}`),
                                );
                            } else {
                                reject(
                                    new Error(
                                        `Error fetching data from Libre Link Up API with status ${message.get_status()}. ${errorMessage}`,
                                    ),
                                );
                            }
                            return;
                        }
                        resolve(JSON.parse(responseText) as T);
                    } catch (err) {
                        reject(new Error(`Error processing request to Libre Link Up API. ${err}`));
                    }
                },
            );
        });
    }
}
