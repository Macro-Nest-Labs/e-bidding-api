import dotenv from 'dotenv';

dotenv.config();

function getDefault(value, defaultValue) {
  if (!value || value === undefined) {
    return defaultValue;
  }

  return value;
}

const productionHosts = [''];
const devHosts = ['http://localhost:8000', 'http://192.168.1.12:8000'];

const isLocal = getDefault(process.env.NODE_ENV, 'development') !== 'production';

export const config = {
  IS_LOCAL: getDefault(process.env.NODE_ENV, 'development') !== 'production',
  MONGO_URI: getDefault(process.env.MONGO_URI, ''),
  REDIS_URL: isLocal ? 'localhost' : getDefault(process.env.REDIS_URL, 'localhost'),

  PORT: parseInt(process.env.PORT ?? '8000'),
  JWT_SECRET: getDefault(process.env.JWT_SECRET, 'REDACTED'),

  DEFAULT_MAX_TIMER: 120 * 1000,
  DEFAULT_MAX_PLAYERS: 14,

  SERVER_URL: getDefault(process.env.SERVER_URL, `http://localhost:${process.env.APP_PORT}`),
  FRONTEND_URL: getDefault(process.env.FRONTEND_URL, 'http://localhost:3000'),

  ALLOWLIST_HOSTS: getDefault(process.env.NODE_ENV, 'development') === 'production' ? productionHosts : devHosts,

  BREVO_PASSWORD: getDefault(process.env.BREVO_PASSWORD, ''),
  ADMIN_EMAIL: getDefault(process.env.ADMIN_EMAIL, ''),
  VERIFY_ENDPOINT_URL: getDefault(process.env.VERIFY_ENDPOINT_URL, 'http://localhost:8000/email/listing-invite'),
  APP_LOGO_URL: getDefault(process.env.APP_LOGO_URL, 'https://argsupplytech.com/images/logo.jpg'),
};
