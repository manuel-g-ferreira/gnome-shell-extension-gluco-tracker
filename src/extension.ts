import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import Settings from './settings/settings.js';
import GlucoseIndicator from './indicator/indicator.js';
import SettingsHelper from './settings/helper.js';
import {Keys} from './settings/keys.js';

export default class GlucoTracker extends Extension {
    _indicator: PanelMenu.Button | null = null;

    enable(): void {
        Settings.initialize(this.getSettings());
        this._indicator = new GlucoseIndicator();

        Main.panel.addToStatusArea(
            this.uuid,
            this._indicator,
            SettingsHelper.get_number(Keys.INDICATOR_POSITION),
            'right',
        );
    }

    disable(): void {
        Settings.destroy();
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
