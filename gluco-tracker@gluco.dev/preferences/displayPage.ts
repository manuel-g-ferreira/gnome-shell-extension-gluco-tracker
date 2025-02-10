import Adw from "gi://Adw";
import Gio from "gi://Gio";
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";

const DisplayPage = GObject.registerClass(
    class DisplayPage extends Adw.PreferencesPage {
        private _settings!: Gio.Settings;
        private _settingsKey!: Record<string, string>;
        private lastIndicatorPos!: number;
        private posIndicatorOffsetRow!: Adw.SpinRow;

        _init(settings: Gio.Settings, settingsKey: Record<string, string>) {
            super._init({
                title: _("Display"),
                icon_name: "video-display-symbolic",
                name: "DisplayPage"
            });
            this._settings = settings;
            this._settingsKey = settingsKey;

            const displayGroup = new Adw.PreferencesGroup({ title: _("Display") });

            // Create a ComboRow for "Show status indicator" mode.
            const showStatusIndicator = new Gtk.StringList();
            showStatusIndicator.append(_("Only when active"));
            showStatusIndicator.append(_("Als"));
            showStatusIndicator.append(_("Never"));
            const showStatusIndicatorRow = new Adw.ComboRow({
                title: _("Show status indicator in top panel"),
                subtitle: _("Enable or disable the Gluco Tracker in the top panel"),
                model: showStatusIndicator,
                selected: this._settings.get_enum(this._settingsKey.SHOW_INDICATOR)
            });

            // Create a SpinRow for indicator position.
            this.lastIndicatorPos = this._settings.get_int(this._settingsKey.INDICATOR_POS_MAX);
            this.posIndicatorOffsetRow = new Adw.SpinRow({
                title: _("Status indicator position"),
                subtitle: _("The position relative of indicator icon to other items"),
                adjustment: new Gtk.Adjustment({
                    lower: -1,
                    upper: this.lastIndicatorPos,
                    step_increment: 1,
                    page_increment: 1,
                    page_size: 0,
                    value: this._settings.get_int(this._settingsKey.INDICATOR_POSITION)
                })
            });

            displayGroup.add(showStatusIndicatorRow);
            displayGroup.add(this.posIndicatorOffsetRow);
            this.add(displayGroup);

            // Bind the SpinRow’s value to the setting.
            this._settings.bind(this._settingsKey.INDICATOR_POSITION, this.posIndicatorOffsetRow, "value", Gio.SettingsBindFlags.DEFAULT);
            this._settings.connect(`changed::${this._settingsKey.INDICATOR_POS_MAX}`, this._updatePosMax.bind(this));
        }

        private _updatePosMax(): void {
            this.lastIndicatorPos = this._settings.get_int(this._settingsKey.INDICATOR_POS_MAX);
            this.posIndicatorOffsetRow.adjustment.set_upper(this.lastIndicatorPos);
        }
    }
);

export default DisplayPage;
