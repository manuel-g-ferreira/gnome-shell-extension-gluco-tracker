imports.gi.versions.Soup = "3.0";
import Soup from "gi://Soup";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { GlucoAPI } from "../glucoApi.js";
import {
    LibreConnectionResponse,
    LibreLinkUpEndpoints,
    LibreLoginResponse,
    LibreResponse
} from "./types.js";
import { encryptSha256, parseUser } from "./utils.js";
import { GlucoseReading } from "../../models/glucoseReading.js";

/**
 * A class for interacting with the Libre Link Up API.
 */
export class LibreLinkApi implements GlucoAPI {
    private readonly apiUrl: string;
    private accessToken: string | null = null;
    private session: Soup.Session;
    private patientId: string | null = null;
    private cache = new Map<string, any>();

    /**
     * Reads GNOME settings from the extension preferences.
     */
    private getSettings(): Gio.Settings {
        return new Gio.Settings({ schema_id: "org.gnome.shell.extensions.gluco-tracker" });
    }
    
    constructor(private options: { email?: string; password?: string; patientId?: string } = {}) {
        const settings = this.getSettings();
        this.apiUrl = settings.get_string("api-url");
        this.patientId = settings.get_string("patient-id") || null;
        this.session = new Soup.Session();
    }

    /**
     * Returns the cached user data (if available) after login.
     */
    public get me() {
        if (!this.cache.has("user")) {
            console.warn("User data is not available. Please log in first.");
            return null;
        }
        return this.cache.get("user");
    }

    /**
     * Logs in to the Libre Link Up API.
     */
    public async login(): Promise<void> {
        const settings = this.getSettings();
        const email = this.options.email || settings.get_string("email");
        const password = this.options.password || settings.get_string("password");

        const response = await this._fetcher<LibreLoginResponse>(LibreLinkUpEndpoints.Login, {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (!response.data) {
            throw new Error("Login failed. No data returned from the API.");
        }

        if (response.status === 2) {
            throw new Error("Invalid credentials. Ensure email and password are correct.");
        }

        this.accessToken = response.data.authTicket.token;
        this.setCache("user", parseUser(response.data.user));
    }

    /**
     * Fetches the latest glucose readings.
     */
    public async fetchGlucoseReadings(): Promise<GlucoseReading[]> {
        return this.history();
    }

    /**
     * Reads the latest glucose measurement.
     */
    public async read(): Promise<GlucoseReading> {
        const response = await this.fetchReading();
        return new GlucoseReading(response.data.connection.glucoseItem);
    }

    /**
     * Fetches glucose history.
     */
    public async history(): Promise<GlucoseReading[]> {
        const response = await this.fetchReading();
        return response.data.graphData.map((item) => new GlucoseReading(item));
    }

    /**
     * Fetches logbook readings.
     */
    public async logbook(): Promise<GlucoseReading[]> {
        const response = await this.fetchLogbook();

        // ✅ Fix: Ensure response.data is defined before mapping.
        if (!response.data) {
            console.warn("Logbook data is empty.");
            return [];
        }

        return response.data.map((item: any) => new GlucoseReading(item));
    }

    /**
     * Fetches the latest glucose readings.
     */
    public async fetchReading(): Promise<LibreConnectionResponse> {
        const patientId = await this.getPatientId();
        const headers = {
            "Account-Id": this.me?.id ? encryptSha256(this.me.id) : "",
        };
        return this._fetcher<LibreConnectionResponse>(`${LibreLinkUpEndpoints.Connections}/${patientId}/graph`, { headers });
    }

    /**
     * Fetches the logbook data.
     */
    public async fetchLogbook(): Promise<LibreResponse> {
        const patientId = await this.getPatientId();
        const headers = {
            "Account-Id": this.me?.id ? encryptSha256(this.me.id) : "",
        };
        return this._fetcher<LibreResponse>(`${LibreLinkUpEndpoints.Connections}/${patientId}/logbook`, { headers });
    }

    /**
     * Retrieves the patient ID from the API.
     */
    private async getPatientId(): Promise<string> {
        const settings = this.getSettings();
        let patientId = settings.get_string("patient-id") || "";

        if (!patientId) {
            const connections = await this.fetchConnections();
            if (!connections.data?.length) {
                throw new Error("No connections found.");
            }
            patientId = connections.data[0].patientId;
        }

        return patientId;
    }

    /**
     * Fetches the API connections.
     */
    public async fetchConnections(): Promise<LibreResponse> {
        if (this.cache.has("connections")) {
            return this.cache.get("connections");
        }

        const headers = {
            "Account-Id": this.me?.id ? encryptSha256(this.me.id) : "",
        };

        const connections = await this._fetcher<LibreResponse>(LibreLinkUpEndpoints.Connections, { headers });

        if (connections?.data?.length) {
            this.setCache("connections", connections);
        }

        return connections;
    }

    /**
     * A generic HTTP request handler.
     */
    private async _fetcher<T = any>(
        endpoint: string,
        options: { method?: string; headers?: Record<string, string>; body?: string } = {}
    ): Promise<T> {
        const url = `${this.apiUrl}/${endpoint}`;
        const message = Soup.Message.new(options.method ?? "GET", url);

        if (options.headers) {
            for (const key in options.headers) {
                message.request_headers.append(key, options.headers[key]);
            }
        }

        if (options.body) {
            const encoder = new TextEncoder();
            const bodyBytes = encoder.encode(options.body);
            const gbytes = GLib.Bytes.new_take(bodyBytes);
            const stream = Gio.MemoryInputStream.new_from_bytes(gbytes);
            message.set_request_body("application/json", stream, bodyBytes.length);
        }

        return new Promise<T>((resolve, reject) => {
            this.session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null, (_session: any, res: any) => {
                try {
                    const responseBody = this.session.send_and_read_finish(res);
                    const responseText = new TextDecoder().decode(responseBody.get_data() as Uint8Array);
                    resolve(JSON.parse(responseText) as T);
                } catch (err) {
                    reject(new Error(`Error fetching from ${url}: ${err}`));
                }
            });
        });
    }

    /**
     * Stores data in the cache.
     */
    private setCache(key: string, value: any): void {
        this.cache.set(key, value);
    }

    /**
     * Clears the cache.
     */
    public clearCache(): void {
        this.cache.clear();
    }

    /**
     * Returns the current access token.
     */
    public getAccessToken(): string {
        return this.accessToken || "";
    }
}
