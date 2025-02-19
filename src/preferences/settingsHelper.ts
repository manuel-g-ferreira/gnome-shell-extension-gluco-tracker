import Settings from './settings.js';

function get_string(key: string): string {
    return (
        Settings.gioSetting.get_string(key) ??
        Settings.gioSetting.get_default_value(key)?.get_string()[0]
    );
}

function set_string(key: string, val: string): boolean {
    return Settings.gioSetting.set_string(key, val);
}

function get_boolean(key: string): boolean {
    return (
        Settings.gioSetting.get_boolean(key) ??
        Settings.gioSetting.get_default_value(key)?.get_boolean()
    );
}

function set_boolean(key: string, val: boolean): boolean {
    return Settings.gioSetting.set_boolean(key, val);
}

function get_number(key: string): number {
    return (
        Settings.gioSetting.get_int(key) ??
        Settings.gioSetting.get_default_value(key)?.get_int64()
    );
}

function set_number(key: string, val: number): boolean {
    return Settings.gioSetting.set_int(key, val);
}

function get_unsigned_number(key: string): number {
    return (
        Settings.gioSetting.get_uint(key) ??
        Settings.gioSetting.get_default_value(key)?.get_uint64()
    );
}

function set_unsigned_number(key: string, val: number): boolean {
    return Settings.gioSetting.set_uint(key, val);
}

export default {
    get_string,
    set_string,
    get_boolean,
    set_boolean,
    get_number,
    set_number,
    get_unsigned_number,
    set_unsigned_number,
};
