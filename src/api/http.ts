'use strict';

import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';
import Gio from 'gi://Gio';

export function get<T>(session: Soup.Session, url: string, headers: Record<string, string> = {}): Promise<T> {
    const message = Soup.Message.new('GET', url);
    for (const key in headers) {
        message.request_headers.append(key, headers[key]);
    }
    return new Promise<T>((resolve, reject) => {
        session.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session: Soup.Session | null, result: Gio.AsyncResult) => {
                try {
                    const responseBody = session!.send_and_read_finish(result);
                    const data = responseBody.get_data() as Uint8Array;
                    const responseText = new TextDecoder('utf-8').decode(data);
                    if (message.get_status() !== Soup.Status.OK) {
                        let errorPayload: unknown;
                        try {
                            errorPayload = JSON.parse(responseText);
                        } catch (e) {
                            errorPayload = responseText;
                        }
                        const errorMessage =
                            typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload
                                ? (errorPayload as {message: string}).message
                                : JSON.stringify(errorPayload, null, 2);
                        reject(new Error(`HTTP error ${message.get_status()}: ${errorMessage}`));
                        return;
                    }
                    resolve(JSON.parse(responseText) as T);
                } catch (err) {
                    reject(new Error(`Error processing GET request: ${err}`));
                }
            },
        );
    });
}

export function post<T>(
    session: Soup.Session,
    url: string,
    body: string,
    headers: Record<string, string> = {},
): Promise<T> {
    const message = Soup.Message.new('POST', url);
    const defaultHeaders: Record<string, string> = {'content-type': 'application/json'};
    const allHeaders = {...defaultHeaders, ...headers};
    for (const key in allHeaders) {
        message.request_headers.append(key, allHeaders[key]);
    }
    const bodyBytes = new TextEncoder().encode(body);
    message.set_request_body_from_bytes('application/json', GLib.Bytes.new_take(bodyBytes));
    return new Promise<T>((resolve, reject) => {
        session.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session: Soup.Session | null, result: Gio.AsyncResult) => {
                try {
                    const responseBody = session!.send_and_read_finish(result);
                    const data = responseBody.get_data() as Uint8Array;
                    const responseText = new TextDecoder('utf-8').decode(data);
                    if (message.get_status() !== Soup.Status.OK) {
                        let errorPayload: unknown;
                        try {
                            errorPayload = JSON.parse(responseText);
                        } catch (e) {
                            errorPayload = responseText;
                        }
                        const errorMessage =
                            typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload
                                ? (errorPayload as {message: string}).message
                                : JSON.stringify(errorPayload, null, 2);
                        reject(new Error(`HTTP error ${message.get_status()}: ${errorMessage}`));
                        return;
                    }
                    resolve(JSON.parse(responseText) as T);
                } catch (err) {
                    reject(new Error(`Error processing POST request: ${err}`));
                }
            },
        );
    });
}
