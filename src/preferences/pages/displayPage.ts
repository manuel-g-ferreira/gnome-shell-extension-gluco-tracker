'use strict';

import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gio from 'gi://Gio';
import Settings from '../settings.js';
import {Keys} from '../settingsKeys.js';
import SettingsHelper from '../settingsHelper.js';

export const DisplayPage = GObject.registerClass(
    {
        GTypeName: 'DisplayPage',
    },
    class DisplayPage extends Adw.PreferencesPage {
        private _settings!: Gio.Settings;

        _init() {
            super._init({
                title: _('Display Preferences'),
                icon_name: 'display-symbolic',
                name: 'DisplayPage',
            });
            this._settings = Settings.getSettings;

            const displayGroup = new Adw.PreferencesGroup();
            this.add(displayGroup);

            // Create a SpinRow for indicator position.
            let lastIndicatorPos = SettingsHelper.get_number(Keys.INDICATOR_POS_MAX);
            const spinRow = new Adw.SpinRow({
                title: _('Status indicator position'),
                subtitle: _('The position relative to other items'),
                adjustment: new Gtk.Adjustment({
                    lower: -1,
                    upper: lastIndicatorPos,
                    step_increment: 1,
                    page_increment: 1,
                    page_size: 0,
                    value: SettingsHelper.get_number(Keys.INDICATOR_POSITION),
                }),
            });
            displayGroup.add(spinRow);

            // Bind the SpinRow using this._settings.bind.
            this._settings.bind(Keys.INDICATOR_POSITION, spinRow.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
            // Update the upper bound if the maximum changes.
            this._settings.connect('changed::' + Keys.INDICATOR_POS_MAX, () => {
                const newMax = SettingsHelper.get_number(Keys.INDICATOR_POS_MAX);
                lastIndicatorPos = newMax;
                spinRow.adjustment.set_upper(newMax);
            });
        }
    },
);
