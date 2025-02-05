import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Define the type for the settings keys object.
type SettingsKeyType = Record<string, string>;

export var ConfigurationPage = GObject.registerClass(
    class ConfigurationPage extends Adw.PreferencesPage {
        _settings: Gio.Settings | undefined;
        _settingsKey: SettingsKeyType | undefined;

        _init(settings: Gio.Settings, settingsKey: SettingsKeyType) {
            super._init({
                title: _('Apps'),
                icon_name: 'applications-symbolic',
                name: 'AppsPage'
            });
            this._settings = settings;
            this._settingsKey = settingsKey;
        }
    });
