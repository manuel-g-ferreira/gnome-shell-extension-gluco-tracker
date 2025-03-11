import Gio from 'gi://Gio';

export default class Settings {
    static _settings: Gio.Settings | null = null;
    static _isInitialized: boolean = false;

    static initialize(settings: Gio.Settings) {
        if (this._isInitialized) {
            return;
        }
        this._settings = settings;
        this._isInitialized = true;
    }

    static destroy() {
        this._isInitialized = false;
        this._settings = null;
    }

    static get getSettings(): Gio.Settings {
        if (!this._settings) {
            throw new Error('Settings not initialized');
        }
        return this._settings;
    }
}
