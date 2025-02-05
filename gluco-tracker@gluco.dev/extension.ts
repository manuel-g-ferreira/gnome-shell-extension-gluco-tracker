import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const GlucoseIndicator = GObject.registerClass(
    class GlucoseIndicator extends PanelMenu.Button {
      // Declare properties with definite assignment assertions.
      _label!: St.Label;
      _prevValue!: number;
      _currentValue!: number;



      _init() {
        // Call the parent initializer with spacing and a title.
        super._init(0.0, _('Gluco Tracker'));

        // Initialize numeric properties.
        this._prevValue = 0;
        this._currentValue = 0;

        // Create a label to display the glucose reading.
        this._label = new St.Label({ text: '' });
        // Add the label to the button (actor).
        this.add_child(this._label);

        // Create a menu item to manually refresh the value.
        let refreshItem = new PopupMenu.PopupMenuItem(_('Refresh Now'));
        refreshItem.connect('activate', () => {
          this._update();
        });
        // Cast the menu to PopupMenu.PopupMenu so that we can call addMenuItem.
        (this.menu as PopupMenu.PopupMenu).addMenuItem(refreshItem);

        // Perform the initial update.
        this._update();

        // Schedule updates every 60 seconds.
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
          this._update();
          return GLib.SOURCE_CONTINUE;
        });
      }

      _update() {
        // If no previous value exists, initialize it.
        if (this._prevValue === 0) {
          this._prevValue = 120; // default starting value
        }
        // Simulate fetching a new glucose value between 100 and 150.
        this._currentValue = 100 + Math.floor(Math.random() * 50);
        const diff = this._currentValue - this._prevValue;
        const arrow = this._computeTrendArrow(diff);
        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
        // Update the label in the format "127 ↑ +8".
        this._label.set_text(`${this._currentValue} ${arrow} ${diffStr}`);
        // Update previous value for the next update.
        this._prevValue = this._currentValue;
      }

      _computeTrendArrow(diff: number): string {
        if (diff > 5) {
          return '↑';   // Strong upward trend.
        } else if (diff > 0) {
          return '↗';   // Mild upward trend.
        } else if (diff === 0) {
          return '→';   // No change.
        } else if (diff < -5) {
          return '↓';   // Strong downward trend.
        } else {
          return '↘';   // Mild downward trend.
        }
      }
    });

export default class MyExtension extends Extension {
  // Use InstanceType<typeof GlucoseIndicator> for the type.
  _indicator: InstanceType<typeof GlucoseIndicator> | null = null;

  enable() {
    // Create an instance of the GlucoseIndicator.
    this._indicator = new GlucoseIndicator(0.0, _('Gluco Tracker'));
    // Add it to the panel using your extension's UUID.
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    // Remove and destroy the indicator.
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }
}
