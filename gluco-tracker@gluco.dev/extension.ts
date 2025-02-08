import { Extension, gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import GlucoseIndicator from "./glucoseIndicator.js";

export default class GlucoTracker extends Extension {
  _indicator: InstanceType<typeof GlucoseIndicator> | null = null;

  enable(): void {
    // Create an instance of the panel indicator.
    this._indicator = new GlucoseIndicator(0.0, _("Gluco Tracker"));
    // Add it to the panel using the extension's UUID.
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable(): void {
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }
}
