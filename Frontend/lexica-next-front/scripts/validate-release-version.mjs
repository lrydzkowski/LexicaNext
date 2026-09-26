import { getAppVersion } from './release-version.mjs';

const version = getAppVersion(process.env.VERSION_TAG, 'true');
console.log(`Validated release version: ${version}`);
