import GObject from "gi://GObject";
import St from "gi://St";
import GLib from "gi://GLib";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";

const GlucoseIndicator = GObject.registerClass(
    class GlucoseIndicator extends PanelMenu.Button {
        _label!: St.Label;
        _prevValue!: number;
        _currentValue!: number;

        _init(): void {
            super._init(0.0, _("Gluco Tracker"));

            this._prevValue = 0;
            this._currentValue = 0;

            // Create a label to display the glucose reading.
            this._label = new St.Label({ text: "" });
            this.add_child(this._label);

            // Add a popup menu item for manual refresh.
            const refreshItem = new PopupMenu.PopupMenuItem(_("Refresh Now"));
            refreshItem.connect("activate", () => {
                this._update();
            });
            (this.menu as PopupMenu.PopupMenu).addMenuItem(refreshItem);

            // Do the initial update.
            this._update();

            // Schedule updates every 60 seconds.
            GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
                this._update();
                return GLib.SOURCE_CONTINUE;
            });
        }

        _update(): void {
            if (this._prevValue === 0) {
                this._prevValue = 120; // Default starting value.
            }
            // Simulate a new glucose reading between 100 and 150.
            this._currentValue = 100 + Math.floor(Math.random() * 50);
            const diff = this._currentValue - this._prevValue;
            const arrow = this._computeTrendArrow(diff);
            const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
            // Update the label text (e.g. "127 ↑ +8").
            this._label.set_text(`${this._currentValue} ${arrow} ${diffStr}`);
            this._prevValue = this._currentValue;
        }

        _computeTrendArrow(diff: number): string {
            if (diff > 5) return "↑";
            else if (diff > 0) return "↗";
            else if (diff === 0) return "→";
            else if (diff < -5) return "↓";
            else return "↘";
        }
    }
);

export default GlucoseIndicator;
