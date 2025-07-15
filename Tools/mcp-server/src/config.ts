import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', 'env-config', '.env');

dotenv.config({ path: envPath, debug: false, quiet: true });

export interface Config {
  apiBaseUrl: string;
  apiKey: string;
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }

  return value;
}

export const config: Config = {
  apiBaseUrl: getRequiredEnvVar('API_BASE_URL'),
  apiKey: getRequiredEnvVar('API_KEY'),
};
