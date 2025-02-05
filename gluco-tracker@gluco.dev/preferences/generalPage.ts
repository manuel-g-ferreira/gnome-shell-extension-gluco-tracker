import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Define the type for the settings keys object.
type SettingsKeyType = Record<string, string>;

export var GeneralPage = GObject.registerClass(
    class GeneralPage extends Adw.PreferencesPage {
        _settings: Gio.Settings | undefined;
        _settingsKey: SettingsKeyType | undefined;

        _init(settings: Gio.Settings, settingsKey: SettingsKeyType) {
            super._init({
                title: _('General'),
                icon_name: 'general-symbolic',
                name: 'GeneralPage'
            });
            this._settings = settings;
            this._settingsKey = settingsKey;

            // Behavior group
            // --------------
            let behaviorGroup = new Adw.PreferencesGroup({
                title: _('Behavior')
            });

            this.add(behaviorGroup);
        }
    });
