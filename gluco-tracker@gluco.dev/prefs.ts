import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import GeneralPage from "./preferences/generalPage.js";
import DisplayPage from "./preferences/displayPage.js";
import ConfigurationPage from "./preferences/configurationPage.js";

// Define your settings keys.
export const SettingsKey = {
  DEFAULT_WIDTH: "prefs-default-width",
  DEFAULT_HEIGHT: "prefs-default-height",
  INDICATOR_POSITION: "indicator-position",
  INDICATOR_INDEX: "indicator-position-index",
  INDICATOR_POS_MAX: "indicator-position-max",
  SHOW_INDICATOR: "show-indicator",
  USERNAME: "username",
  PASSWORD: "password",
  API_SOURCE: "api-source",
  ACCESS_TOKEN: "access-token"
};

export default class GlucoTrackerPreferences extends ExtensionPreferences {
  _settings!: Gio.Settings;

  fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
    // Get the default display.
    const display = Gdk.Display.get_default();
    if (!display) throw new Error("No default Gdk display found.");
    const iconTheme = Gtk.IconTheme.get_for_display(display);
    if (!(iconTheme.get_search_path() || []).includes(this.path + "/icons")) {
      iconTheme.add_search_path(this.path + "/icons");
    }
    this._settings = this.getSettings();

    // Create the individual preference pages.
    const generalPage = new GeneralPage({});
    generalPage._init(this._settings, SettingsKey);

    const displayPage = new DisplayPage({});
    displayPage._init(this._settings, SettingsKey);

    const configurationPage = new ConfigurationPage({});
    configurationPage._init(this._settings, SettingsKey);

    const prefsWidth = this._settings.get_int(SettingsKey.DEFAULT_WIDTH);
    const prefsHeight = this._settings.get_int(SettingsKey.DEFAULT_HEIGHT);
    window.set_default_size(prefsWidth, prefsHeight);
    window.set_search_enabled(true);

    window.add(generalPage);
    window.add(displayPage);
    window.add(configurationPage);

    window.connect("close-request", () => {
      const currentWidth = window.default_width;
      const currentHeight = window.default_height;
      if (currentWidth !== prefsWidth || currentHeight !== prefsHeight) {
        this._settings.set_int(SettingsKey.DEFAULT_WIDTH, currentWidth);
        this._settings.set_int(SettingsKey.DEFAULT_HEIGHT, currentHeight);
      }
      window.destroy();
    });

    return Promise.resolve();
  }
}
