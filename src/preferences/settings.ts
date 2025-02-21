import Gio from 'gi://Gio';

export default class Settings {
    static _settings: Gio.Settings | null;
    static _isInitialized: boolean = false;

    static initialize(settings: Gio.Settings) {
        if (this._isInitialized) {
            return;
        }
        this._settings = settings;
        this._isInitialized = true;
    }

    static destroy() {
        if (this._isInitialized) {
            this._isInitialized = false;
            this._settings = null;
        }
    }

    static get getSettings(): Gio.Settings {
        return this._settings ?? new Gio.Settings();
    }
}
