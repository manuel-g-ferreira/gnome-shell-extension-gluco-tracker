'use strict';

import GObject from 'gi://GObject';
import St from 'gi://St';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {GlucoseReading} from '../api/librelink/types/reading.js';
import {createGlucoAPI} from '../api/factory/glucoApiFactory.js';
import SettingsHelper from '../settings/helper.js';
import {Keys} from '../settings/keys.js';
import {TimeScheduler} from './timeScheduler.js';
import {TrendFormatter} from './trendFormatter.js';
import GlucoseAlarm from './alarm.js';

export default GObject.registerClass(
    {
        GTypeName: 'GlucoseIndicator',
    },
    class GlucoseIndicator extends PanelMenu.Button {
        private readonly _label: St.Label;
        private _prevValue: number = 0;
        private _currentValue: number = 0;
        private _scheduler: TimeScheduler = new TimeScheduler();
        private _alarm: GlucoseAlarm | null = null;

        constructor() {
            super(0.0, 'GlucoseIndicator');

            // Store the alarm reference
            this._alarm = new GlucoseAlarm();

            // Create a container for proper vertical alignment
            const box = new St.BoxLayout({
                vertical: false,
                style_class: 'panel-status-menu-box',
                y_align: 2,
                y_expand: true,
            });

            this._label = new St.Label({
                text: 'Loading...',
                y_align: 2,
                y_expand: true,
            });

            box.add_child(this._label);
            this.add_child(box);

            this._update();
            this._scheduleNextUpdate();
        }

        private _update(): void {
            if (!this._isApiConfigured()) {
                this._label.set_text('Not configured');
                return;
            }

            if (SettingsHelper.get_string(Keys.ACCESS_TOKEN) === '') {
                this._label.set_text('Log in');
                return;
            }

            const api = createGlucoAPI();
            api.read()
                .then((reading: GlucoseReading) => {
                    this._prevValue = this._currentValue;
                    this._currentValue = reading.value;

                    const diffStr = TrendFormatter.formatDiff(this._currentValue, this._prevValue);
                    const trendArrow = TrendFormatter.getTrendArrow(reading.trend);
                    this._label.set_text(`${reading.value} ${trendArrow} ${diffStr}`);

                    // Check if we need to trigger an alarm based on the glucose reading
                    if (this._alarm && reading.value) {
                        this._alarm.checkAlarm(reading.value);
                    }
                })
                .catch((err: Error) => {
                    this._label.set_text('Error');
                    console.error('Error updating GlucoseIndicator: ' + err.message);
                });
        }

        private _isApiConfigured(): boolean {
            const token = SettingsHelper.get_string(Keys.ACCESS_TOKEN);
            return !!token;
        }

        private _scheduleNextUpdate(): void {
            const intervalMinutes = SettingsHelper.get_number(Keys.REFRESH_INTERVAL) || 1;
            this._scheduler.schedule(
                intervalMinutes,
                () => this._update(),
                () => this._scheduleNextUpdate(),
            );
        }

        destroy() {
            this._scheduler.clear();

            // Clean up the alarm when indicator is destroyed
            if (this._alarm) {
                this._alarm.destroy();
                this._alarm = null;
            }

            super.destroy();
        }
    },
);
