'use strict';

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Soup from '@girs/soup-3.0';
import { GlucoAPI } from '../glucoApi.js';
import SettingsHelper from '../../preferences/settingsHelper.js';
import { Keys } from '../../preferences/settingsKeys.js';
import { LibreLoginResponse } from './types/types.js';

export class LibreLinkAPI implements GlucoAPI {
    private _session: Soup.Session;
    private _authData!: LibreLoginResponse;

    constructor() {
        this._session = new Soup.Session();
    }

    async login(email: string, password: string): Promise<void> {
        const url = 'https://api.librelink.example/login'; // Replace with your actual endpoint
        const message = Soup.Message.new('POST', url);
        const payload = JSON.stringify({ email, password });
        const encoder = new TextEncoder();
        const bodyBytes = encoder.encode(payload);
        // set_request_body_from_bytes accepts a GLib.Bytes instance.
        message.set_request_body_from_bytes('application/json', GLib.Bytes.new_take(bodyBytes));

        await new Promise<void>((resolve, reject) => {
            this._session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (source_object: Soup.Session | null, result: Gio.AsyncResult) => {
                    try {
                        const responseBody = this._session.send_and_read_finish(result);
                        const data = responseBody.get_data() as Uint8Array;
                        if (!data) {
                            reject(new Error("No data received from LibreLink API"));
                            return;
                        }
                        const responseText = new TextDecoder().decode(data);
                        const response = JSON.parse(responseText) as LibreLoginResponse;
                        if (response.status === 200 && response.data && "authTicket" in response.data) {
                            this._authData = response;
                            // Store the token from the authTicket.
                            const token = (response.data as { authTicket: { token: string } }).authTicket.token;
                            SettingsHelper.set_string(Keys.ACCESS_TOKEN, token);
                            resolve();
                        } else {
                            const errMsg =
                                (response.error && typeof response.error === 'object' && 'message' in response.error)
                                    ? response.error.message
                                    : "unknown error";
                            reject(new Error("LibreLink login failed: " + errMsg));
                        }
                    } catch (err) {
                        reject(err);
                    }
                }
            );
        });
    }
}
