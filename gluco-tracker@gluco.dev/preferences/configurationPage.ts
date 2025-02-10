import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import GObject from "gi://GObject";
import { LibreLinkApi } from "../api/librelink/librelinkApi.js";

const ConfigurationPage = GObject.registerClass(
    class ConfigurationPage extends Adw.PreferencesPage {
        private _settings!: Gio.Settings;
        private _settingsKey!: Record<string, string>;

        _init(settings: Gio.Settings, settingsKey: Record<string, string>) {
            super._init({
                title: _("User Preferences"),
                icon_name: "applications-symbolic",
                name: "ConfigurationPage"
            });
            this._settings = settings;
            this._settingsKey = settingsKey;

            // -------------------------
            // Credentials Group
            // -------------------------
            const credentialsGroup = new Adw.PreferencesGroup({ title: _("User Credentials") });
            const username = new Adw.EntryRow({ title: _("Username") });
            const password = new Adw.PasswordEntryRow({ title: _("Password") });
            credentialsGroup.add(username);
            credentialsGroup.add(password);
            this.add(credentialsGroup);

            this._settings.bind(this._settingsKey.USERNAME, username, "text", Gio.SettingsBindFlags.DEFAULT);
            this._settings.bind(this._settingsKey.PASSWORD, password, "text", Gio.SettingsBindFlags.DEFAULT);

            const loginRow = new Adw.ActionRow({ title: _("Login to API") });
            const loginButton = new Gtk.Button({ label: _("Login") });
            loginRow.add_suffix(loginButton);
            credentialsGroup.add(loginRow);

            loginButton.connect("clicked", () => {
                // Retrieve the username and password from the settings.
                const username = this._settings.get_string(this._settingsKey.USERNAME);
                const password = this._settings.get_string(this._settingsKey.PASSWORD);

                // ✅ FIXED: Use an options object instead of two separate parameters.
                const api = new LibreLinkApi({ email: username, password });

                api.login().then(() => {
                    // On successful login, store the access token.
                    this._settings.set_string(this._settingsKey.ACCESS_TOKEN, api.getAccessToken());
                    // Optionally, notify the user (for example, using Adw.Toast).
                }).catch((err: Error) => {
                    // Optionally, display an error message.
                    log("Login error: " + err.message);
                });
            });

            // -------------------------
            // API Group (Glucose Tracker API)
            // -------------------------
            const apiGroup = new Adw.PreferencesGroup({ title: _("Glucose Tracker") });

            // Create radio buttons for API source selection.
            const librelink = new Gtk.CheckButton({ label: _("LibreLink"), halign: Gtk.Align.START });
            const dexcom = new Gtk.CheckButton({ label: _("Dexcom"), group: librelink, halign: Gtk.Align.START });

            const apiSourceKey = this._settingsKey.API_SOURCE;
            const currentValue = this._settings.get_int(apiSourceKey);

            if (currentValue === 0) {
                librelink.set_active(true);
            } else if (currentValue === 1) {
                dexcom.set_active(true);
            } else {
                // If no selection is stored, leave both inactive (or set a default).
                librelink.set_active(false);
                dexcom.set_active(false);
            }

            librelink.connect("toggled", () => {
                if (librelink.get_active()) {
                    this._settings.set_int(apiSourceKey, 0);
                }
            });
            dexcom.connect("toggled", () => {
                if (dexcom.get_active()) {
                    this._settings.set_int(apiSourceKey, 1);
                }
            });

            this._settings.connect(`changed::${apiSourceKey}`, () => {
                const newValue = this._settings.get_int(apiSourceKey);
                if (newValue === 0) {
                    librelink.set_active(true);
                } else if (newValue === 1) {
                    dexcom.set_active(true);
                }
            });

            const apiBox = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 12,
                margin_top: 12,
                margin_bottom: 12,
                margin_start: 12,
                margin_end: 12,
            });
            apiBox.append(librelink);
            apiBox.append(dexcom);

            apiGroup.add(apiBox);
            this.add(apiGroup);
        }
    }
);

export default ConfigurationPage;
