'use strict';

import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gio from 'gi://Gio';
import Settings from '../settings/settings.js';
import Gtk from 'gi://Gtk';
import SettingsHelper from '../settings/helper.js';
import {Keys} from '../settings/keys.js';

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

            this._settings.bind(Keys.LOW_THRESHOLD, lowThresholdRow.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);

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

            this._settings.bind(
                Keys.HIGH_THRESHOLD,
                highThresholdRow.adjustment,
                'value',
                Gio.SettingsBindFlags.DEFAULT,
            );

            const enableAlarmRow = new Adw.SwitchRow({
                title: _('Enable Glucose Alarms'),
                subtitle: _('Enable alarm notifications for glucose thresholds'),
            });
            alarmGroup.add(enableAlarmRow);
            this._settings.bind(Keys.ENABLE_ALARM, enableAlarmRow, 'active', Gio.SettingsBindFlags.DEFAULT);

            const enableSoundRow = new Adw.SwitchRow({
                title: _('Enable Sound Alerts'),
                subtitle: _('Play sound when glucose is outside thresholds'),
            });
            alarmGroup.add(enableSoundRow);
            this._settings.bind(Keys.ENABLE_SOUND, enableSoundRow, 'active', Gio.SettingsBindFlags.DEFAULT);

            const enableNotificationRow = new Adw.SwitchRow({
                title: _('Show Notifications'),
                subtitle: _('Display notification when glucose is outside thresholds'),
            });
            alarmGroup.add(enableNotificationRow);
            this._settings.bind(
                Keys.ENABLE_NOTIFICATION,
                enableNotificationRow,
                'active',
                Gio.SettingsBindFlags.DEFAULT,
            );

            const soundRow = new Adw.EntryRow({
                title: _('Alarm Sound'),
            });
            alarmGroup.add(soundRow);
            this._settings.bind(Keys.ALARM_SOUND, soundRow, 'text', Gio.SettingsBindFlags.DEFAULT);

            const updateGroup = new Adw.PreferencesGroup({
                title: _('Update Interval'),
            });
            this.add(updateGroup);

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

            this._settings.bind(
                Keys.REFRESH_INTERVAL,
                refreshIntervalRow.adjustment,
                'value',
                Gio.SettingsBindFlags.DEFAULT,
            );
        }
    },
);
