import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),
  ipWhitelist: (process.env.ALLOWED_IP_WHITELIST || '127.0.0.1,::1')
    .split(',')
    .map((ip) => ip.trim()),
}));
