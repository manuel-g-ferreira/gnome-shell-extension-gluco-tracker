import GLib from 'gi://GLib';

export class TimeScheduler {
    private _timeout: number | null = null;

    schedule(intervalMinutes: number, callback: () => void, rescheduleCallback: () => void): void {
        this.clear();

        // Get current time and calculate next update time
        const now = GLib.DateTime.new_now_local();
        if (!now) {
            this._setupFallbackTimer(60, callback, rescheduleCallback);
            return;
        }

        const nextUpdateTime = this._calculateNextUpdateTime(now, intervalMinutes);
        if (!nextUpdateTime) {
            this._setupFallbackTimer(60, callback, rescheduleCallback);
            return;
        }

        // Calculate seconds until the next update
        const secondsUntilNextUpdate = nextUpdateTime.difference(now) / 1000000;

        // Schedule the update
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, secondsUntilNextUpdate, () => {
            callback();
            rescheduleCallback();
            return GLib.SOURCE_REMOVE;
        });
    }

    clear(): void {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
    }

    private _calculateNextUpdateTime(now: GLib.DateTime, intervalMinutes: number): GLib.DateTime | null {
        const nextUpdate = now.add_minutes(intervalMinutes);
        if (!nextUpdate) {
            return null;
        }

        // Round to the exact minute
        return GLib.DateTime.new(
            nextUpdate.get_timezone(),
            nextUpdate.get_year(),
            nextUpdate.get_month(),
            nextUpdate.get_day_of_month(),
            nextUpdate.get_hour(),
            nextUpdate.get_minute(),
            0,
        );
    }

    private _setupFallbackTimer(seconds: number, callback: () => void, rescheduleCallback: () => void): void {
        console.error('Using fallback timer');
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, seconds, () => {
            callback();
            rescheduleCallback();
            return GLib.SOURCE_REMOVE;
        });
    }
}
