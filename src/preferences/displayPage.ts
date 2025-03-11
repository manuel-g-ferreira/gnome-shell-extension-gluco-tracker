'use strict';

import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gio from 'gi://Gio';
import Settings from '../settings/settings.js';
import {Keys} from '../settings/keys.js';
import SettingsHelper from '../settings/helper.js';

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

            const indicatiorositionGroup = new Adw.PreferencesGroup({
                title: _('Indicator Position'),
            });
            this.add(indicatiorositionGroup);

            // Show indicator
            const indicatorPositionOptions = new Gtk.StringList();
            indicatorPositionOptions.append(_('Left'));
            indicatorPositionOptions.append(_('Center'));
            indicatorPositionOptions.append(_('Right'));
            const indicatorPositionRow = new Adw.ComboRow({
                title: _('Indicator position'),
                subtitle: _('The position of the status indicator'),
                model: indicatorPositionOptions,
                selected: this._settings.get_enum(Keys.INDICATOR_POSITION),
            });

            indicatorPositionRow.connect('notify::selected', (widget) => {
                SettingsHelper.set_enum(Keys.INDICATOR_POSITION, widget.selected);
            });

            indicatiorositionGroup.add(indicatorPositionRow);

            const spinRow = new Adw.SpinRow({
                title: _('Status indicator index'),
                subtitle: _('Lower values place the indicator further to the left'),
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: Math.max(0, SettingsHelper.get_number(Keys.INDICATOR_POS_MAX)),
                    step_increment: 1,
                    page_increment: 1,
                    page_size: 0,
                    value: SettingsHelper.get_number(Keys.INDICATOR_INDEX),
                }),
            });
            indicatiorositionGroup.add(spinRow);

            // Bind to indicator-position-index setting (numeric value)
            this._settings.bind(Keys.INDICATOR_INDEX, spinRow.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);

            // Update max when indicator index changes
            this._settings.connect('changed::' + Keys.INDICATOR_POS_MAX, () => {
                const newMax = SettingsHelper.get_number(Keys.INDICATOR_POS_MAX);
                spinRow.adjustment.set_upper(Math.max(0, newMax));
            });
        }
    },
);
