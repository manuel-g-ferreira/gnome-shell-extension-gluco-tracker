'use strict';

import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {Keys} from '../settings/keys.js';
import SettingsHelper from '../settings/helper.js';

export class GlucoseAlarm {
    private _lastNotification: number = 0;
    private _notificationSource: MessageTray.Source | null = null;
    private readonly _notificationTimeout = 60000; // ms between notifications (1 minute)

    constructor() {
        if (Main.messageTray) {
            this._notificationSource = new MessageTray.Source({
                title: 'Glucose Tracker',
                iconName: 'utilities-system-monitor-symbolic',
            });
            Main.messageTray.add(this._notificationSource);
        }
    }

    checkAlarm(glucoseLevel: number): boolean {
        if (!glucoseLevel) return false;

        const lowThreshold = SettingsHelper.get_number(Keys.LOW_THRESHOLD);
        const highThreshold = SettingsHelper.get_number(Keys.HIGH_THRESHOLD);
        const alarmEnabled = SettingsHelper.get_boolean(Keys.ENABLE_ALARM);

        if (!alarmEnabled) return false;

        if (glucoseLevel <= lowThreshold) {
            this.triggerAlarm('low', glucoseLevel, lowThreshold);
            return true;
        } else if (glucoseLevel >= highThreshold) {
            this.triggerAlarm('high', glucoseLevel, highThreshold);
            return true;
        }

        return false;
    }

    triggerAlarm(type: 'low' | 'high', glucoseLevel: number, threshold: number): void {
        const now = Date.now();
        if (now - this._lastNotification < this._notificationTimeout) return;

        this._lastNotification = now;

        if (SettingsHelper.get_boolean(Keys.ENABLE_SOUND)) {
            this.playAlarmSound();
        }

        if (SettingsHelper.get_boolean(Keys.ENABLE_NOTIFICATION)) {
            const title = type === 'low' ? _('Low Glucose Alert') : _('High Glucose Alert');

            const body =
                type === 'low'
                    ? _(`Glucose level ${glucoseLevel} is below threshold ${threshold}`)
                    : _(`Glucose level ${glucoseLevel} is above threshold ${threshold}`);

            this.showNotification(title, body);
        }
    }

    playAlarmSound(): void {
        const soundPath = SettingsHelper.get_string(Keys.ALARM_SOUND) || 'dialog-warning';

        try {
            GLib.spawn_command_line_async(`canberra-gtk-play -f ${soundPath}`);
        } catch (e) {
            console.error(`Failed to play alarm sound: ${e}`);
            try {
                GLib.spawn_command_line_async('canberra-gtk-play -i dialog-warning');
            } catch (error) {
                console.error(`Failed to play fallback sound: ${error}`);
            }
        }
    }

    showNotification(title: string, body: string): void {
        if (!this._notificationSource) return;

        try {
            const notification = new MessageTray.Notification({
                source: this._notificationSource,
                title: title,
                body: body,
                iconName: 'utilities-system-monitor-symbolic',
            });

            notification.set_property('urgency', MessageTray.Urgency.CRITICAL);

            this._notificationSource.addNotification(notification);
        } catch (e) {
            console.error(`Failed to show notification: ${e}`);
        }
    }

    destroy(): void {
        if (this._notificationSource && Main.messageTray) {
            this._notificationSource.destroy(MessageTray.NotificationDestroyedReason.SOURCE_CLOSED);
        }
        this._notificationSource = null;
    }
}

export default GlucoseAlarm;
