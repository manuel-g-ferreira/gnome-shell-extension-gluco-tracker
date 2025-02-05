import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gdk from 'gi://Gdk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Import preferences pages. Adjust the paths as needed.
import * as GeneralPrefs from './preferences/generalPage.js';
import * as DisplayPrefs from './preferences/displayPage.js';
import * as ConfigurationPrefs from './preferences/configurationPage.js';

const SettingsKey = {
  DEFAULT_WIDTH: 'prefs-default-width',
  DEFAULT_HEIGHT: 'prefs-default-height',
  INDICATOR_POSITION: 'indicator-position',
  INDICATOR_INDEX: 'indicator-position-index',
  INDICATOR_POS_MAX: 'indicator-position-max',
  SHOW_INDICATOR: 'show-indicator',
};

export default class GlucoTrackerPreferences extends ExtensionPreferences {
  _settings?: Gio.Settings;

  fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
    // Get the default display and verify it is not null.
    let display = Gdk.Display.get_default();
    if (!display) {
      throw new Error("No default Gdk display found.");
    }
    let iconTheme = Gtk.IconTheme.get_for_display(display);

    // Add our icons directory if not already in the search path.
    if (!(iconTheme.get_search_path() || []).includes(this.path + '/icons')) {
      iconTheme.add_search_path(this.path + '/icons');
    }

    // Retrieve settings.
    this._settings = this.getSettings();

    // Create the preferences pages using this._settings.
    // Cast settings to any to bypass type mismatches with the constructors.
    const generalPage = new GeneralPrefs.GeneralPage(this._settings as any, SettingsKey);
    const displayPage = new DisplayPrefs.DisplayPage(this._settings as any, SettingsKey);
    const configurationPage = new ConfigurationPrefs.ConfigurationPage(this._settings as any, SettingsKey);

    let prefsWidth = this._settings.get_int(SettingsKey.DEFAULT_WIDTH);
    let prefsHeight = this._settings.get_int(SettingsKey.DEFAULT_HEIGHT);

    window.set_default_size(prefsWidth, prefsHeight);
    window.set_search_enabled(true);

    // Add pages to the preferences window.
    window.add(generalPage);
    window.add(displayPage);
    window.add(configurationPage);

    // Save window size adjustments when the window is closed.
    window.connect('close-request', () => {
      let currentWidth = window.default_width;
      let currentHeight = window.default_height;
      if (currentWidth !== prefsWidth || currentHeight !== prefsHeight) {
        this._settings!.set_int(SettingsKey.DEFAULT_WIDTH, currentWidth);
        this._settings!.set_int(SettingsKey.DEFAULT_HEIGHT, currentHeight);
      }
      window.destroy();
    });

    return Promise.resolve();
  }
}
