'use strict';

import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {GlucoseReading} from '../api/librelink/types/reading.js';
import {createGlucoAPI} from '../api/factory/glucoApiFactory.js';
import SettingsHelper from '../preferences/settingsHelper.js';
import {Keys} from '../preferences/settingsKeys.js';

export default GObject.registerClass(
    {
        GTypeName: 'GlucoseIndicator',
    },
    class GlucoseIndicator extends PanelMenu.Button {
        private readonly _label!: St.Label;
        private _prevValue!: number;
        private _currentValue!: number;
        private _timeout: number | null = null;

        constructor() {
            super(0.0, 'GlucoseIndicator');
            this._currentValue = 0;
            this._prevValue = 0;
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

            this.scheduleNextMinuteUpdate();
        }

        private _update(): void {
            const api = createGlucoAPI();
            api.read()
                .then((reading: GlucoseReading) => {
                    this._prevValue = this._currentValue;
                    this._currentValue = reading.value;

                    let diffStr = '';
                    if (this._prevValue !== 0) {
                        const diff = this._currentValue - this._prevValue;
                        diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                    }

                    const trendArrow = this._getTrendArrow(reading.trend);
                    this._label.set_text(`${reading.value} ${trendArrow} ${diffStr}`);
                })
                .catch((err: Error) => {
                    this._label.set_text('Error');
                    console.error('Error updating GlucoseIndicator: ' + err.message);
                });
        }

        private _getTrendArrow(trend: number): string {
            switch (trend) {
                case 1:
                    return '↓';
                case 2:
                    return '↘';
                case 3:
                    return '→';
                case 4:
                    return '↗';
                case 5:
                    return '↑';
                default:
                    return '';
            }
        }

        private scheduleNextMinuteUpdate(): void {
            // Clear any existing timeout
            if (this._timeout) {
                GLib.source_remove(this._timeout);
                this._timeout = null;
            }

            // Get current time
            const now = GLib.DateTime.new_now_local();
            if (!now) {
                console.error('Failed to get current time');
                return;
            }

            // Get refresh interval in minutes
            const intervalMinutes = SettingsHelper.get_number(Keys.REFRESH_INTERVAL) || 1;

            // Calculate when the next update should occur
            let nextUpdate = now.add_minutes(intervalMinutes);
            if (!nextUpdate) {
                console.error('Failed to calculate next update time');
                // Fallback to a default interval of 1 minute
                this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
                    this._update();
                    this.scheduleNextMinuteUpdate();
                    return GLib.SOURCE_REMOVE;
                });
                return;
            }

            // Round down to the exact minute (setting seconds to zero)
            nextUpdate = GLib.DateTime.new(
                nextUpdate.get_timezone(),
                nextUpdate.get_year(),
                nextUpdate.get_month(),
                nextUpdate.get_day_of_month(),
                nextUpdate.get_hour(),
                nextUpdate.get_minute(),
                0,
            );

            if (!nextUpdate) {
                console.error('Failed to create DateTime for next update');
                // Fallback to a default interval
                this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
                    this._update();
                    this.scheduleNextMinuteUpdate();
                    return GLib.SOURCE_REMOVE;
                });
                return;
            }

            // Calculate seconds until the next update
            const secondsUntilNextUpdate = nextUpdate.difference(now) / 1000000;

            // Schedule the update
            this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, secondsUntilNextUpdate, () => {
                this._update();
                // Schedule the next update after this one completes
                this.scheduleNextMinuteUpdate();
                return GLib.SOURCE_REMOVE;
            });
        }

        destroy() {
            if (this._timeout) {
                GLib.source_remove(this._timeout);
                this._timeout = null;
            }
            super.destroy();
        }
    },
);
