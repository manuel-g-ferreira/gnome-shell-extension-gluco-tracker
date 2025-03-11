import Adw from 'gi://Adw';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Settings from './settings/settings.js';
import {Keys} from './settings/keys.js';
import SettingsHelper from './settings/helper.js';
import {GeneralPage} from './preferences/generalPage.js';
import {DisplayPage} from './preferences/displayPage.js';
import {ConfigurationPage} from './preferences/configurationPage.js';

export default class GlucoTrackerPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
        Settings.initialize(this.getSettings());

        const prefsWidth = SettingsHelper.get_number(Keys.DEFAULT_WIDTH);
        const prefsHeight = SettingsHelper.get_number(Keys.DEFAULT_HEIGHT);
        window.set_default_size(prefsWidth, prefsHeight);
        window.set_search_enabled(true);

        const generalPage = new GeneralPage();
        const displayPage = new DisplayPage();
        const configurationPage = new ConfigurationPage();

        window.add(generalPage);
        window.add(displayPage);
        window.add(configurationPage);

        window.connect('close-request', () => {
            const currentWidth = window.default_width;
            const currentHeight = window.default_height;
            if (currentWidth !== prefsWidth || currentHeight !== prefsHeight) {
                SettingsHelper.set_number(Keys.DEFAULT_WIDTH, currentWidth);
                SettingsHelper.set_number(Keys.DEFAULT_HEIGHT, currentHeight);
            }
            Settings.destroy();
        });

        return Promise.resolve();
    }
}
