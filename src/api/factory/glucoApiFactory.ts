import {GlucoAPI} from '../glucoApi.js';
import {Keys} from '../../preferences/settingsKeys.js';
import {LibreLinkAPI} from '../librelink/librelinkApi.js';
import {DexcomAPI} from '../dexcom/dexcomApi.js';
import SettingsHelper from '../../preferences/settingsHelper.js';

export function createGlucoAPI(): GlucoAPI {
    const selectedApi = SettingsHelper.get_number(Keys.API_SOURCE);

    if (selectedApi === 0) {
        return new LibreLinkAPI();
    } else if (selectedApi === 1) {
        return new DexcomAPI();
    } else {
        throw new Error('Invalid API selection');
    }
}
