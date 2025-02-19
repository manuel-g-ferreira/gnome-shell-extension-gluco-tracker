import Adw from 'gi://Adw';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Settings from './preferences/settings.js';
import {Keys} from './preferences/settingsKeys.js';
import SettingsHelper from './preferences/settingsHelper.js';
import {createLogger} from './utils/logger.js';
import {GeneralPage} from './preferences/pages/generalPage.js';

const logger = createLogger('prefs');

export default class GlucoTrackerPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
        Settings.initialize(this.getSettings());

        const prefsWidth = SettingsHelper.get_number(Keys.DEFAULT_WIDTH);
        const prefsHeight = SettingsHelper.get_number(Keys.DEFAULT_HEIGHT);
        window.set_default_size(prefsWidth, prefsHeight);
        window.set_search_enabled(true);

        const generalPage = new GeneralPage();

        window.add(generalPage);

        window.connect('close-request', () => {
            const currentWidth = window.default_width;
            const currentHeight = window.default_height;
            if (currentWidth !== prefsWidth || currentHeight !== prefsHeight) {
                SettingsHelper.set_number(Keys.DEFAULT_WIDTH, currentWidth);
                SettingsHelper.set_number(Keys.DEFAULT_HEIGHT, currentHeight);
            }
            window.destroy();
        });

        return Promise.resolve();
    }
}
