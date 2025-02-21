'use strict';

import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gio from 'gi://Gio';
import Settings from '../settings.js';

export const GeneralPage = GObject.registerClass(
    {
        GTypeName: 'GeneralPage',
    },
    class GeneralPage extends Adw.PreferencesPage {
        private _settings!: Gio.Settings;

        _init() {
            super._init({
                title: _('General'),
                icon_name: 'general-symbolic',
                name: 'GeneralPage',
            });
            this._settings = Settings.getSettings;
        }
    },
);
