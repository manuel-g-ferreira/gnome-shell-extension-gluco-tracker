'use strict';

import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gio from 'gi://Gio';
import Settings from '../settings.js';
import Gtk from 'gi://Gtk';
import SettingsHelper from '../settingsHelper.js';
import {Keys} from '../settingsKeys.js';

export const GeneralPage = GObject.registerClass(
    {
        GTypeName: 'GeneralPage',
    },
    class GeneralPage extends Adw.PreferencesPage {
        private _settings!: Gio.Settings;

        _init() {
            super._init({
                title: _('General'),
                icon_name: 'window-symbolic',
                name: 'GeneralPage',
            });
            this._settings = Settings.getSettings;

            const alarmGroup = new Adw.PreferencesGroup({
                title: _('Alarms and Notifications'),
            });
            this.add(alarmGroup);

            // Create a SpinRow for low threshold.
            const lowThresholdRow = new Adw.SpinRow({
                title: _('Low Glucose Threshold'),
                subtitle: _('Threshold for low glucose warning (in mg/dL)'),
                adjustment: new Gtk.Adjustment({
                    lower: 40,
                    upper: 100,
                    step_increment: 1,
                    page_increment: 1,
                    page_size: 0,
                    value: SettingsHelper.get_number(Keys.LOW_THRESHOLD),
                }),
            });
            alarmGroup.add(lowThresholdRow);

            // Bind the SpinRow using this._settings.bind.
            this._settings.bind(Keys.LOW_THRESHOLD, lowThresholdRow.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);

            // Create a SpinRow for high threshold.
            const highThresholdRow = new Adw.SpinRow({
                title: _('High Glucose Threshold'),
                subtitle: _('Threshold for high glucose warning (in mg/dL)'),
                adjustment: new Gtk.Adjustment({
                    lower: 100,
                    upper: 300,
                    step_increment: 1,
                    page_increment: 1,
                    page_size: 0,
                    value: SettingsHelper.get_number(Keys.HIGH_THRESHOLD),
                }),
            });
            alarmGroup.add(highThresholdRow);

            // Bind the SpinRow using this._settings.bind.
            this._settings.bind(
                Keys.HIGH_THRESHOLD,
                highThresholdRow.adjustment,
                'value',
                Gio.SettingsBindFlags.DEFAULT,
            );

            // Create a new group for the update refresh interval.
            const updateGroup = new Adw.PreferencesGroup({
                title: _('Update Interval'),
            });
            this.add(updateGroup);

            // Create a SpinRow for the update refresh interval.
            const refreshIntervalRow = new Adw.SpinRow({
                title: _('Update Refresh Interval'),
                subtitle: _('Interval for updating glucose data (in minutes)'),
                adjustment: new Gtk.Adjustment({
                    lower: 1,
                    upper: 60,
                    step_increment: 1,
                    page_increment: 1,
                    page_size: 0,
                    value: SettingsHelper.get_number(Keys.REFRESH_INTERVAL),
                }),
            });
            updateGroup.add(refreshIntervalRow);

            // Bind the SpinRow using this._settings.bind.
            this._settings.bind(
                Keys.REFRESH_INTERVAL,
                refreshIntervalRow.adjustment,
                'value',
                Gio.SettingsBindFlags.DEFAULT,
            );
        }
    },
);
