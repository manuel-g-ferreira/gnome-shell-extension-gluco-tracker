'use strict';

import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {GlucoseReading} from "../api/librelink/types/reading.js";
import {createGlucoAPI} from "../api/factory/glucoApiFactory.js";

const GlucoseIndicator = GObject.registerClass(
    class GlucoseIndicator extends PanelMenu.Button {
        private _label!: St.Label;
        private _prevValue!: number;
        private _currentValue!: number;

        _init(): void {
            this._currentValue = 0;
            this._prevValue = 0;

            // Create a label that will display the glucose reading and trend.
            this._label = new St.Label({ text: "" });
            this.add_child(this._label);

            // Perform the initial update.
            this._update();

            GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
                this._update();
                return GLib.SOURCE_CONTINUE;
            });
        }

        /**
         * Updates the indicator label with the latest glucose reading.
         */
        private _update(): void {
            const api = createGlucoAPI();
            api.read()
                .then((reading: GlucoseReading) => {
                    this._prevValue = this._currentValue;
                    this._currentValue = reading.value;
                    const diff = this._currentValue - this._prevValue;
                    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                    this._label.set_text(`${reading.value} ${reading.trend} ${diffStr}`);
                })
                .catch((err: Error) => {
                    this._label.set_text("Error");
                    log("Error updating GlucoseIndicator: " + err.message);
                });
        }
    }
);

export default GlucoseIndicator;
