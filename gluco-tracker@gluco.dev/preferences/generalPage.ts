import Adw from "gi://Adw";
import Gio from "gi://Gio";
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import GObject from "gi://GObject";

const GeneralPage = GObject.registerClass(
    class GeneralPage extends Adw.PreferencesPage {
        private _settings!: Gio.Settings;
        private _settingsKey!: Record<string, string>;

        _init(settings: Gio.Settings, settingsKey: Record<string, string>) {
            super._init({
                title: _("General"),
                icon_name: "general-symbolic",
                name: "GeneralPage"
            });
            this._settings = settings;
            this._settingsKey = settingsKey;

            // Example: Create a Behavior group.
            const behaviorGroup = new Adw.PreferencesGroup({ title: _("Behavior") });
            this.add(behaviorGroup);
        }
    }
);

export default GeneralPage;
