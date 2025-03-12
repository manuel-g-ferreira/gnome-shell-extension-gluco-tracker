import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import Settings from './settings/settings.js';
import GlucoseIndicator from './indicator/indicator.js';
import SettingsHelper from './settings/helper.js';
import {Keys} from './settings/keys.js';

export default class GlucoTracker extends Extension {
    _indicator: PanelMenu.Button | null = null;
    _settingsChangedIds: number[] = [];

    enable(): void {
        Settings.initialize(this.getSettings());
        this._indicator = new GlucoseIndicator();

        this._addIndicatorToPanel();

        this._settingsChangedIds.push(
            Settings.getSettings.connect(`changed::${Keys.INDICATOR_POSITION}`, () => this._updateIndicatorPosition()),
        );

        this._settingsChangedIds.push(
            Settings.getSettings.connect(`changed::${Keys.INDICATOR_INDEX}`, () => this._updateIndicatorPosition()),
        );
    }

    _addIndicatorToPanel(): void {
        if (!this._indicator) return;

        const position = SettingsHelper.get_enum(Keys.INDICATOR_POSITION);
        const index = SettingsHelper.get_number(Keys.INDICATOR_INDEX);

        Main.panel.addToStatusArea(this.uuid, this._indicator, index, this._getPositionString(position));
    }

    _updateIndicatorPosition(): void {
        if (this._indicator) {
            this._indicator.destroy();
        }

        this._indicator = new GlucoseIndicator();

        this._addIndicatorToPanel();
    }

    _getPositionString(position: number): string {
        switch (position) {
            case 0:
                return 'left';
            case 1:
                return 'center';
            case 2:
                return 'right';
            default:
                return 'right';
        }
    }

    disable(): void {
        this._settingsChangedIds.forEach((id) => {
            if (id > 0) Settings.getSettings.disconnect(id);
        });
        this._settingsChangedIds = [];

        Settings.destroy();
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
