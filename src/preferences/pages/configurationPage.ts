'use strict';

import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Settings from '../settings.js';
import {Keys} from '../settingsKeys.js';
import SettingsHelper from '../settingsHelper.js';

export const ConfigurationPage = GObject.registerClass(
    {
        GTypeName: 'ConfigurationPage',
    },
    class ConfigurationPage extends Adw.PreferencesPage {
        private _settings!: Gio.Settings;

        _init(): void {
            super._init({
                title: _('User Preferences'),
                icon_name: 'applications-symbolic',
                name: 'ConfigurationPage',
            });
            this._settings = Settings.getSettings;

            // --- API Group ---
            const apiGroup = new Adw.PreferencesGroup({
                title: _('Glucose Tracker'),
            });
            this.add(apiGroup);

            // Create radio buttons and group them.
            const radioLibrelink = new Gtk.CheckButton({
                label: _('LibreLink'),
                halign: Gtk.Align.START,
            });
            const radioDexcom = new Gtk.CheckButton({
                label: _('Dexcom'),
                group: radioLibrelink,
                halign: Gtk.Align.START,
            });
            const apiBox = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 12,
                margin_top: 12,
                margin_bottom: 12,
                margin_start: 12,
                margin_end: 12,
            });
            apiBox.append(radioLibrelink);
            apiBox.append(radioDexcom);
            apiGroup.add(apiBox);

            const apiSourceKey = Keys.API_SOURCE;
            const currentValue = SettingsHelper.get_number(apiSourceKey);
            if (currentValue === 0) {
                radioLibrelink.set_active(true);
            } else if (currentValue === 1) {
                radioDexcom.set_active(true);
            } else {
                radioLibrelink.set_active(false);
                radioDexcom.set_active(false);
            }

            radioLibrelink.connect('toggled', () => {
                if (radioLibrelink.get_active()) {
                    SettingsHelper.set_number(apiSourceKey, 0);
                }
            });
            radioDexcom.connect('toggled', () => {
                if (radioDexcom.get_active()) {
                    SettingsHelper.set_number(apiSourceKey, 1);
                }
            });

            this._settings.connect('changed::' + apiSourceKey, () => {
                const newValue = SettingsHelper.get_number(apiSourceKey);
                if (newValue === 0) {
                    radioLibrelink.set_active(true);
                } else if (newValue === 1) {
                    radioDexcom.set_active(true);
                }
            });

            // --- Credentials Group ---
            const credentialsGroup = new Adw.PreferencesGroup({
                title: _('User Credentials'),
            });
            const usernameRow = new Adw.EntryRow({title: _('Username')});
            const passwordRow = new Adw.PasswordEntryRow({
                title: _('Password'),
            });
            credentialsGroup.add(usernameRow);
            credentialsGroup.add(passwordRow);
            this.add(credentialsGroup);

            usernameRow.connect('notify::text', () => {
                SettingsHelper.set_string(Keys.USERNAME, usernameRow.text);
            });
            this._settings.connect('changed::' + Keys.USERNAME, () => {
                usernameRow.text = this._settings.get_string(Keys.USERNAME);
            });

            passwordRow.connect('notify::text', () => {
                SettingsHelper.set_string(Keys.PASSWORD, passwordRow.text);
            });
            this._settings.connect('changed::' + Keys.PASSWORD, () => {
                passwordRow.text = this._settings.get_string(Keys.PASSWORD);
            });

            const loginButton = new Gtk.Button({label: _('Login')});
            loginButton.margin_top = 12;
            loginButton.margin_bottom = 12;
            credentialsGroup.add(loginButton);

            loginButton.connect('clicked', () => {
                // Insert login logic here.
            });
        }
    },
);
