import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import GObject from "gi://GObject";

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

            // -------------------------
            // API Group (Glucose Tracker API)
            // -------------------------
            const apiGroup = new Adw.PreferencesGroup({ title: _("Glucose Tracker") });

            // Create radio buttons for API source selection.
            const librelinkRadio = new Gtk.CheckButton({ label: _("LibreLink"), halign: Gtk.Align.START });
            const dexcomRadio = new Gtk.CheckButton({ label: _("Dexcom"), group: librelinkRadio, halign: Gtk.Align.START });

            const apiSourceKey = this._settingsKey.API_SOURCE;
            const currentValue = this._settings.get_int(apiSourceKey);

            if (currentValue === 0) {
                librelinkRadio.set_active(true);
            } else if (currentValue === 1) {
                dexcomRadio.set_active(true);
            } else {
                // If no selection is stored, leave both inactive (or set a default).
                librelinkRadio.set_active(false);
                dexcomRadio.set_active(false);
            }

            librelinkRadio.connect("toggled", () => {
                if (librelinkRadio.get_active()) {
                    this._settings.set_int(apiSourceKey, 0);
                }
            });
            dexcomRadio.connect("toggled", () => {
                if (dexcomRadio.get_active()) {
                    this._settings.set_int(apiSourceKey, 1);
                }
            });

            this._settings.connect(`changed::${apiSourceKey}`, () => {
                const newValue = this._settings.get_int(apiSourceKey);
                if (newValue === 0) {
                    librelinkRadio.set_active(true);
                } else if (newValue === 1) {
                    dexcomRadio.set_active(true);
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
            apiBox.append(librelinkRadio);
            apiBox.append(dexcomRadio);

            apiGroup.add(apiBox);
            this.add(apiGroup);
        }
    }
);

export default ConfigurationPage;
