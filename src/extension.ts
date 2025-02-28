import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import GlucoseIndicator from "./indicator/indicator.js";

export default class GlucoTracker extends Extension {

    _indicator: InstanceType<typeof GlucoseIndicator> | null = null;

    enable(): void {
        this._indicator = new GlucoseIndicator(0.0, this.metadata.name, false);

        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable(): void {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
