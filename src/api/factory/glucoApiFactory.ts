// factory/glucoApiFactory.ts
import {GlucoAPI} from '../glucoApi.js';
import Settings from '../../preferences/settings.js';
import {Keys} from '../../preferences/settingsKeys.js';
import {LibreLinkAPI} from '../librelink/librelinkApi.js';
import {DexcomAPI} from '../dexcom/dexcomApi.js';

/**
 * Creates an instance of GlucoAPI based on the user's settings.
 * Returns a LibreLinkAPI if the API_SOURCE setting is 0,
 * and a DexcomAPI if it's 1.
 */
export function createGlucoAPI(): GlucoAPI {
    const settings = Settings.getSettings;
    const selectedApi = settings.get_int(Keys.API_SOURCE);

    if (selectedApi === 0) {
        return new LibreLinkAPI();
    } else if (selectedApi === 1) {
        return new DexcomAPI();
    } else {
        throw new Error('Invalid API selection');
    }
}
